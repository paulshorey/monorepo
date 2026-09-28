import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_GLOBEX_MARKET_SESSION_CONFIG, SESSION_PROFILES } from "./market-session-config.js";
import { getConfiguredMarketSessionForTicker, WeeklyMarketSession } from "./market-session.js";
import { RollingCandleWindow } from "./rolling-candle-window.js";
import { RollingWindow1m } from "./rolling-window.js";
import { extractTicker } from "./symbol.js";
import type { CandleForDb, CandleState, NormalizedTrade } from "./types.js";

const globexSession = new WeeklyMarketSession(DEFAULT_GLOBEX_MARKET_SESSION_CONFIG);
const tokyoSession = new WeeklyMarketSession(SESSION_PROFILES.tokyo_daytime);

function makeTrade(symbol: string, price: number): NormalizedTrade {
  return {
    ticker: extractTicker(symbol),
    symbol,
    price,
    size: 1,
    isAsk: true,
    isBid: false,
    bidPrice: price - 0.25,
    askPrice: price + 0.25,
    bidSize: 10,
    askSize: 10,
  };
}

function addTrade(window: RollingWindow1m, symbol: string, isoTime: string, price: number): void {
  window.addTrade({
    trade: makeTrade(symbol, price),
    secondBucket: isoTime,
    minuteBucket: isoTime.slice(0, 16) + ":00.000Z",
  });
}

function makeCandleForDb(time: string, price: number): CandleForDb {
  const candle: CandleState = {
    open: price,
    high: price,
    low: price,
    close: price,
    volume: 1,
    askVolume: 1,
    bidVolume: 0,
    unknownSideVolume: 0,
    sumBidDepth: 10,
    sumAskDepth: 10,
    sumSpread: 0,
    sumMidPrice: price,
    sumPriceVolume: price,
    maxTradeSize: 1,
    largeTradeCount: 0,
    largeTradeVolume: 0,
    tradeCount: 1,
    symbol: "ESH6",
    currentCvd: 1,
    metricsOHLC: {
      cvd: {
        open: 1,
        high: 1,
        low: 1,
        close: 1,
      },
    },
  };

  return {
    key: `ES|${time}`,
    ticker: "ES",
    time,
    candle,
  };
}

test("1m rolling VWAP accumulator stays continuous across summer Globex maintenance", () => {
  const window = new RollingWindow1m({
    windowSeconds: 3,
    maxSyntheticGapSeconds: 5,
    sessionCalendar: globexSession,
  });

  addTrade(window, "ESH6", "2026-03-09T20:59:57.000Z", 100);
  addTrade(window, "ESH6", "2026-03-09T20:59:58.000Z", 101);
  addTrade(window, "ESH6", "2026-03-09T20:59:59.000Z", 102);
  addTrade(window, "ESH6", "2026-03-09T22:00:00.000Z", 103);
  window.finalizeAll();

  const reopenCandle = window.drainPendingCandles().at(-1);
  assert.ok(reopenCandle);
  assert.equal(reopenCandle.time, "2026-03-09T22:00:00.000Z");
  assert.equal(reopenCandle.candle.volume, 3);
  assert.equal(reopenCandle.candle.sumPriceVolume, 306);
  assert.equal(reopenCandle.candle.open, 101);
  assert.equal(reopenCandle.candle.close, 103);
  assert.equal(window.getStats().gapResets, 0);
});

test("1h rolling VWAP accumulator stays continuous across summer Globex maintenance", () => {
  const window = new RollingCandleWindow({
    windowSize: 3,
    expectedIntervalMs: 60_000,
    label: "1h@1m",
    sessionCalendar: globexSession,
  });

  window.addCandles([
    makeCandleForDb("2026-03-09T20:57:00.000Z", 100),
    makeCandleForDb("2026-03-09T20:58:00.000Z", 101),
    makeCandleForDb("2026-03-09T20:59:00.000Z", 102),
    makeCandleForDb("2026-03-09T22:00:00.000Z", 103),
  ]);

  const reopenCandle = window.drainPendingCandles().at(-1);
  assert.ok(reopenCandle);
  assert.equal(reopenCandle.time, "2026-03-09T22:00:00.000Z");
  assert.equal(reopenCandle.candle.volume, 3);
  assert.equal(reopenCandle.candle.sumPriceVolume, 306);
  assert.equal(reopenCandle.candle.open, 101);
  assert.equal(reopenCandle.candle.close, 103);
  assert.equal(window.getStats().gapResets, 0);
});

test("rolling continuity works with a non-US session calendar", () => {
  const window = new RollingWindow1m({
    windowSeconds: 3,
    maxSyntheticGapSeconds: 5,
    sessionCalendar: tokyoSession,
  });

  addTrade(window, "ESH6", "2026-01-05T02:29:57.000Z", 100);
  addTrade(window, "ESH6", "2026-01-05T02:29:58.000Z", 101);
  addTrade(window, "ESH6", "2026-01-05T02:29:59.000Z", 102);
  addTrade(window, "ESH6", "2026-01-05T03:30:00.000Z", 103);
  window.finalizeAll();

  const reopenCandle = window.drainPendingCandles().at(-1);
  assert.ok(reopenCandle);
  assert.equal(reopenCandle.time, "2026-01-05T03:30:00.000Z");
  assert.equal(reopenCandle.candle.volume, 3);
  assert.equal(reopenCandle.candle.sumPriceVolume, 306);
  assert.equal(window.getStats().gapResets, 0);
});

test("rolling window can resolve different session calendars per ticker", () => {
  const window = new RollingWindow1m({
    windowSeconds: 3,
    maxSyntheticGapSeconds: 5,
    sessionCalendarResolver: (ticker) => getConfiguredMarketSessionForTicker(ticker),
  });

  addTrade(window, "ESH6", "2026-03-09T20:59:57.000Z", 100);
  addTrade(window, "ESH6", "2026-03-09T20:59:58.000Z", 101);
  addTrade(window, "ESH6", "2026-03-09T20:59:59.000Z", 102);
  addTrade(window, "ESH6", "2026-03-09T22:00:00.000Z", 103);

  addTrade(window, "NKH6", "2026-01-05T02:29:57.000Z", 200);
  addTrade(window, "NKH6", "2026-01-05T02:29:58.000Z", 201);
  addTrade(window, "NKH6", "2026-01-05T02:29:59.000Z", 202);
  addTrade(window, "NKH6", "2026-01-05T03:30:00.000Z", 203);
  window.finalizeAll();

  const candlesByTicker = window.drainPendingCandles().reduce<Record<string, CandleForDb[]>>((grouped, candle) => {
    grouped[candle.ticker] ??= [];
    grouped[candle.ticker].push(candle);
    return grouped;
  }, {});
  const esReopen = candlesByTicker.ES?.at(-1);
  const nkReopen = candlesByTicker.NK?.at(-1);

  assert.ok(esReopen);
  assert.equal(esReopen.time, "2026-03-09T22:00:00.000Z");
  assert.equal(esReopen.candle.sumPriceVolume, 306);

  assert.ok(nkReopen);
  assert.equal(nkReopen.time, "2026-01-05T03:30:00.000Z");
  assert.equal(nkReopen.candle.sumPriceVolume, 606);
  assert.equal(window.getStats().gapResets, 0);
});
