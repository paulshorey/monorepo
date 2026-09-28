import assert from "node:assert/strict";
import test from "node:test";

import type { StoredCandleRow } from "./canonical-candle.js";
import { candleForDbFromStoredRow } from "./canonical-candle.js";

function makeStoredRow(): StoredCandleRow {
  return {
    time: "2026-03-10T14:00:00.000Z",
    ticker: "ES",
    symbol: "ESH6",
    open: 6000,
    high: 6001,
    low: 5999,
    close: 6000.5,
    volume: 10,
    ask_volume: 6,
    bid_volume: 4,
    cvd_open: 100,
    cvd_high: 105,
    cvd_low: 99,
    cvd_close: 102,
    trades: 10,
    max_trade_size: 3,
    big_trades: 0,
    big_volume: 0,
    vd: 2,
    vd_ratio: 0.2,
    book_imbalance: 0,
    price_pct: 0,
    divergence: 0,
    sum_bid_depth: 10,
    sum_ask_depth: 12,
    sum_price_volume: 60005,
    unknown_volume: 0,
  };
}

test("rejects incomplete CVD OHLC when canonical source rows must be complete", () => {
  const invalidRow: StoredCandleRow = {
    ...makeStoredRow(),
    cvd_high: null,
  };

  assert.throws(
    () => candleForDbFromStoredRow(invalidRow, { requireCompleteCvd: true }),
    /missing complete CVD OHLC/i,
  );
});
