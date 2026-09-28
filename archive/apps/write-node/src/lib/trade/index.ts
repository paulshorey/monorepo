/**
 * Trade Processing Library
 *
 * Shared utilities for processing canonical candle data across the writer
 * pipeline, including raw TBBO -> 1m@1s and canonical 1m@1s -> 1h@1m stages.
 */

// Types
export type {
  TbboRecord,
  CandleState,
  CandleForDb,
  AggregatorStats,
  NormalizedTrade,
  MetricCalculationContext,
} from "./types.js";

// Side detection (Lee-Ready algorithm)
export { inferSideFromPrice, determineTradeSide } from "./side-detection.js";

// Large trade thresholds
export { LARGE_TRADE_THRESHOLDS, getLargeTradeThreshold } from "./thresholds.js";

// Timestamp utilities
export {
  MAX_TRADE_AGE_MS,
  nsToMs,
  getMinuteBucket,
  getSecondBucket,
  isMinuteBoundary,
  isHourBoundary,
  toMinuteBucket,
  toSecondBucket,
  checkTradeAge,
} from "./timestamp.js";

// Market-session utilities
export type { MarketSessionConfig, OpenBucketCollection, WeeklySessionWindowInput } from "./market-session.js";
export {
  WeeklyMarketSession,
  collectOpenBucketTimesBetween,
  getConfiguredMarketSession,
  getConfiguredMarketSessionForTicker,
  getConfiguredMarketSessionResolver,
  isMarketOpenAt,
  parseWeeklySessionWindows,
} from "./market-session.js";
export {
  DEFAULT_MARKET_SESSION_PROFILE,
  DEFAULT_GLOBEX_MARKET_SESSION_CONFIG,
  DEFAULT_MARKET_SESSION_CONFIG,
  getSessionProfileForTicker,
  MARKET_SESSION_PROFILE_ENV_VAR,
  MARKET_SESSION_OPEN_WINDOWS_ENV_VAR,
  MARKET_SESSION_TIME_ZONE_ENV_VAR,
  SESSION_PROFILE_BY_TICKER,
  SESSION_PROFILES,
} from "./market-session-config.js";

// Symbol utilities
export { extractTicker } from "./symbol.js";

// Front-month contract tracker
export { FrontMonthTracker } from "./front-month.js";

// Candle aggregation
export {
  createCandleFromTrade,
  updateCandleWithTrade,
  updateCandleCvdOHLC,
} from "./candle-aggregation.js";

// Database writer utilities
export { writeCandles } from "./db-writer.js";

// Canonical candle helpers
export type { StoredCandleRow } from "./canonical-candle.js";
export { candleForDbFromStoredRow, candleStateFromStoredRow } from "./canonical-candle.js";

// Shared rolling-window engine
export type { RollingTickerSnapshot, RollingWindowStats, TimedTradeInput } from "./rolling-window.js";
export { RollingWindow1m } from "./rolling-window.js";

// Shared higher-timeframe candle-window engine
export type { RollingCandleTickerSnapshot, RollingCandleWindowStats } from "./rolling-candle-window.js";
export { RollingCandleWindow } from "./rolling-candle-window.js";
