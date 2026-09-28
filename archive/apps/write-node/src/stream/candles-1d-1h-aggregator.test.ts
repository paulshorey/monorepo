import assert from "node:assert/strict";
import test from "node:test";

import type { CandleForDb, StoredCandleRow } from "../lib/trade/index.js";
import { candleForDbFromStoredRow } from "../lib/trade/index.js";

process.env.TIMESCALE_DB_URL ??= "postgres://test:test@localhost:5432/test";

const { Candles1d1hAggregator } = await import("./candles-1d-1h-aggregator.js");

const BASE_TIME_MS = Date.parse("2026-03-10T00:00:00.000Z");

function isLatestTargetQuery(text: string): boolean {
  return text.includes("SELECT DISTINCT ON (ticker)") && text.includes("FROM candles_1d_1h");
}

function isHydrationQuery(text: string): boolean {
  return text.includes("ROW_NUMBER() OVER") && text.includes("FROM candles_1h_1m");
}

function isReconciliationQuery(text: string): boolean {
  return text.includes("WITH latest_target(ticker, latest_target_time)");
}

function hourIso(offset: number): string {
  return new Date(BASE_TIME_MS + offset * 60 * 60 * 1000).toISOString();
}

function makeStoredRow(offset: number): StoredCandleRow {
  const time = hourIso(offset);
  const price = 6000 + offset;
  const cvd = offset + 1;

  return {
    time,
    ticker: "ES",
    symbol: "ESH6",
    open: price,
    high: price,
    low: price,
    close: price,
    volume: 1,
    ask_volume: 1,
    bid_volume: 0,
    cvd_open: cvd,
    cvd_high: cvd,
    cvd_low: cvd,
    cvd_close: cvd,
    trades: 1,
    max_trade_size: 1,
    big_trades: 0,
    big_volume: 0,
    vd: 1,
    vd_ratio: 1,
    book_imbalance: 0,
    price_pct: 0,
    divergence: 0,
    sum_bid_depth: 10,
    sum_ask_depth: 10,
    sum_price_volume: price,
    unknown_volume: 0,
  };
}

function makeBaseCandle(offset: number): CandleForDb {
  return candleForDbFromStoredRow(makeStoredRow(offset));
}

test("emits a 1d row once a fresh 24-hour ring has warmed up", async () => {
  const seedRows = Array.from({ length: 24 }, (_, i) => makeStoredRow(i));
  const writtenTimes: string[] = [];

  const aggregator = new Candles1d1hAggregator({
    queryable: {
      query: async <Row = unknown>(text: string, _values?: unknown[]) => {
        if (isLatestTargetQuery(text)) {
          return { rows: [] as Row[] };
        }

        if (isHydrationQuery(text)) {
          return { rows: seedRows as Row[] };
        }

        if (isReconciliationQuery(text)) {
          return { rows: [] as Row[] };
        }

        throw new Error(`Unexpected query: ${text}`);
      },
    },
    writeCandlesFn: async (_queryable, _tableName, candles) => {
      writtenTimes.push(...candles.map((candle) => candle.time));
    },
  });

  await aggregator.initialize();
  assert.equal(aggregator.addBaseCandles([makeBaseCandle(24)]), 1);

  await aggregator.flushCompleted();

  assert.deepEqual(writtenTimes, [hourIso(24)]);
  assert.equal(aggregator.getCandlesWritten(), 1);
});

test("filters non-hour-boundary inputs out of the daily aggregator", async () => {
  const aggregator = new Candles1d1hAggregator({
    queryable: {
      query: async <Row = unknown>() => ({ rows: [] as Row[] }),
    },
    writeCandlesFn: async () => {},
  });

  await aggregator.initialize();

  const minuteOffsetCandle: CandleForDb = {
    ...makeBaseCandle(0),
    time: "2026-03-10T01:30:00.000Z",
    key: "ES|2026-03-10T01:30:00.000Z",
  };
  const hourBoundaryCandle = makeBaseCandle(2);

  assert.equal(aggregator.addBaseCandles([minuteOffsetCandle]), 0);
  assert.equal(aggregator.addBaseCandles([hourBoundaryCandle]), 1);
});
