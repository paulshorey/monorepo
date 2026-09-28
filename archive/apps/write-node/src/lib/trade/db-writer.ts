/**
 * Database Writer for Candles
 *
 * Shared logic for writing candles to the database.
 * Used across the canonical writer pipeline for both lower- and
 * higher-timeframe candle tables.
 *
 * Schema: 27 columns. Price and CVD have OHLC. Derived metrics (vd_ratio,
 * book_imbalance, price_pct, divergence) are calculated at write time from
 * the candle's raw aggregation state. Raw accumulators (sum_bid_depth,
 * sum_ask_depth, sum_price_volume, unknown_volume) are stored for correct
 * higher-timeframe aggregation. VWAP is derived at query time from
 * sum_price_volume / volume — not stored per-row.
 */

import type { CandleForDb, CandleState } from "./types.js";
import { calculateVd, calculateVdRatio } from "../metrics/index.js";
import { calculateBookImbalance } from "../metrics/book-imbalance.js";
import { calculatePricePct } from "../metrics/price.js";
import { calculateDivergence } from "../metrics/absorption.js";

/** Number of columns in the candles INSERT statement */
const COLUMNS_PER_ROW = 27;

interface Queryable {
  query: (text: string, values: (string | number | null)[]) => Promise<unknown>;
}

/**
 * Build placeholder string for parameterized query
 * @param offset - Starting parameter number (0-based index * COLUMNS_PER_ROW)
 * @param count - Number of columns
 */
function buildPlaceholder(offset: number, count: number): string {
  const parts: string[] = [];
  for (let i = 1; i <= count; i++) {
    parts.push(`$${offset + i}`);
  }
  return `(${parts.join(", ")})`;
}

/**
 * Build the INSERT query for candles
 * @param tableName - Target table name (e.g., "candles_1m_1s")
 * @param placeholders - Array of placeholder strings from buildPlaceholder
 */
function buildCandleInsertQuery(tableName: string, placeholders: string[]): string {
  return `
    INSERT INTO ${tableName} (
      time, ticker, symbol,
      open, high, low, close, volume,
      ask_volume, bid_volume,
      cvd_open, cvd_high, cvd_low, cvd_close,
      vd, vd_ratio, book_imbalance, price_pct, divergence,
      trades, max_trade_size, big_trades, big_volume,
      sum_bid_depth, sum_ask_depth, sum_price_volume, unknown_volume
    )
    VALUES ${placeholders.join(", ")}
    ON CONFLICT (ticker, time) DO UPDATE SET
      symbol = EXCLUDED.symbol,
      open = EXCLUDED.open,
      high = EXCLUDED.high,
      low = EXCLUDED.low,
      close = EXCLUDED.close,
      volume = EXCLUDED.volume,
      ask_volume = EXCLUDED.ask_volume,
      bid_volume = EXCLUDED.bid_volume,
      cvd_open = EXCLUDED.cvd_open,
      cvd_high = EXCLUDED.cvd_high,
      cvd_low = EXCLUDED.cvd_low,
      cvd_close = EXCLUDED.cvd_close,
      vd = EXCLUDED.vd,
      vd_ratio = EXCLUDED.vd_ratio,
      book_imbalance = EXCLUDED.book_imbalance,
      price_pct = EXCLUDED.price_pct,
      divergence = EXCLUDED.divergence,
      trades = EXCLUDED.trades,
      max_trade_size = EXCLUDED.max_trade_size,
      big_trades = EXCLUDED.big_trades,
      big_volume = EXCLUDED.big_volume,
      sum_bid_depth = EXCLUDED.sum_bid_depth,
      sum_ask_depth = EXCLUDED.sum_ask_depth,
      sum_price_volume = EXCLUDED.sum_price_volume,
      unknown_volume = EXCLUDED.unknown_volume
  `;
}

/**
 * Calculate derived metrics from candle state.
 * Used by both fallback and OHLC row builders.
 */
function calculateDerivedMetrics(candle: CandleState) {
  const vd = candle.askVolume - candle.bidVolume;
  const vdRatio = calculateVdRatio(candle.askVolume, candle.bidVolume);
  const bookImbalance = calculateBookImbalance(candle.sumBidDepth, candle.sumAskDepth);
  const pricePct = calculatePricePct(candle.open, candle.close);
  const divergence = calculateDivergence(pricePct, vdRatio);
  return { vd, vdRatio, bookImbalance, pricePct, divergence };
}

/**
 * Build values array for a single candle row (fallback when no metricsOHLC)
 * Used when a candle doesn't have OHLC tracking (shouldn't normally happen)
 */
function buildFallbackRowValues(time: string, ticker: string, candle: CandleState, cvd: number): (string | number | null)[] {
  const { vd, vdRatio, bookImbalance, pricePct, divergence } = calculateDerivedMetrics(candle);

  return [
    time,
    ticker,
    candle.symbol,
    candle.open,
    candle.high,
    candle.low,
    candle.close,
    candle.volume,
    // Volume breakdown
    candle.askVolume,
    candle.bidVolume,
    // CVD OHLC (all same since no tracking)
    cvd,
    cvd,
    cvd,
    cvd,
    // Volume Delta & derived metrics
    vd,
    vdRatio,
    bookImbalance,
    pricePct,
    divergence,
    // Activity
    candle.tradeCount,
    candle.maxTradeSize,
    candle.largeTradeCount,
    candle.largeTradeVolume,
    // Raw accumulators for higher-timeframe aggregation
    candle.sumBidDepth,
    candle.sumAskDepth,
    candle.sumPriceVolume,
    candle.unknownSideVolume,
  ];
}

/**
 * Build values array for a single candle row with metricsOHLC
 */
function buildOhlcRowValues(time: string, ticker: string, candle: CandleState): (string | number | null)[] {
  const m = candle.metricsOHLC!;
  const { vd, vdRatio, bookImbalance, pricePct, divergence } = calculateDerivedMetrics(candle);

  return [
    time,
    ticker,
    candle.symbol,
    candle.open,
    candle.high,
    candle.low,
    candle.close,
    candle.volume,
    // Volume breakdown
    candle.askVolume,
    candle.bidVolume,
    // CVD OHLC (tracked throughout the candle)
    m.cvd.open,
    m.cvd.high,
    m.cvd.low,
    m.cvd.close,
    // Volume Delta & derived metrics
    vd,
    vdRatio,
    bookImbalance,
    pricePct,
    divergence,
    // Activity
    candle.tradeCount,
    candle.maxTradeSize,
    candle.largeTradeCount,
    candle.largeTradeVolume,
    // Raw accumulators for higher-timeframe aggregation
    candle.sumBidDepth,
    candle.sumAskDepth,
    candle.sumPriceVolume,
    candle.unknownSideVolume,
  ];
}

/**
 * Context for CVD calculation during batch writes
 */
export interface CvdContext {
  /** Get base CVD for a ticker */
  getBaseCvd: (ticker: string) => number;
  /** Update CVD after processing a candle */
  updateCvd?: (ticker: string, newCvd: number) => void;
}

/**
 * Build INSERT parameters for a batch of candles
 *
 * @param candles - Array of candles to insert
 * @param cvdContext - Context for CVD calculations
 * @returns Object with values array and placeholders array
 */
function buildCandleInsertParams(
  candles: CandleForDb[],
  cvdContext: CvdContext,
): {
  values: (string | number | null)[];
  placeholders: string[];
} {
  const values: (string | number | null)[] = [];
  const placeholders: string[] = [];

  candles.forEach(({ ticker, time, candle }, i) => {
    const m = candle.metricsOHLC;
    const offset = i * COLUMNS_PER_ROW;

    placeholders.push(buildPlaceholder(offset, COLUMNS_PER_ROW));

    if (!m) {
      // Fallback: no metricsOHLC, calculate CVD from base
      const baseCvd = cvdContext.getBaseCvd(ticker);
      const vd = calculateVd(candle.askVolume, candle.bidVolume);
      const cvd = baseCvd + vd;
      cvdContext.updateCvd?.(ticker, cvd);

      values.push(...buildFallbackRowValues(time, ticker, candle, cvd));
    } else {
      // Has metricsOHLC - use it
      cvdContext.updateCvd?.(ticker, m.cvd.close);
      values.push(...buildOhlcRowValues(time, ticker, candle));
    }
  });

  return { values, placeholders };
}

/**
 * Sort and write candles with a single UPSERT query.
 */
export async function writeCandles(queryable: Queryable, tableName: string, candles: CandleForDb[]): Promise<void> {
  if (candles.length === 0) {
    return;
  }

  const sorted = [...candles].sort((a, b) => {
    if (a.ticker !== b.ticker) {
      return a.ticker.localeCompare(b.ticker);
    }
    return a.time.localeCompare(b.time);
  });

  const cvdContext: CvdContext = {
    getBaseCvd: () => 0,
    updateCvd: () => {},
  };

  const { values, placeholders } = buildCandleInsertParams(sorted, cvdContext);
  const query = buildCandleInsertQuery(tableName, placeholders);
  await queryable.query(query, values);
}
