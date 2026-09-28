/**
 * Candle Aggregation
 *
 * Shared logic for aggregating trades into OHLCV candles with order flow metrics.
 * Used by the TBBO -> 1m@1s layer shared by live streaming and historical ingest.
 *
 * Only CVD retains OHLC tracking (it's a running total that evolves within a candle).
 * All other metrics are calculated once at flush time from the candle's raw state.
 */

import type { CandleState, NormalizedTrade, MetricCalculationContext } from "./types.js";
import { getLargeTradeThreshold } from "./thresholds.js";
import { calculateVd } from "../metrics/index.js";
import { initCvdOHLC, updateCvdOHLC } from "../metrics/ohlc.js";

/**
 * Create a new empty candle state from a trade
 *
 * @param trade - The first trade for this candle
 * @returns New CandleState initialized with the trade data
 */
export function createCandleFromTrade(trade: NormalizedTrade): CandleState {
  const { price, size, isAsk, isBid, symbol, bidPrice, askPrice, bidSize, askSize, ticker } = trade;

  // Calculate spread and midpoint for this trade
  // Use Math.abs() because in crossed/inverted markets bid can exceed ask
  const spread = askPrice > 0 && bidPrice > 0 ? Math.abs(askPrice - bidPrice) : 0;
  const midPrice = askPrice > 0 && bidPrice > 0 ? (askPrice + bidPrice) / 2 : price;

  // Check if this is a large trade
  const largeTradeThreshold = getLargeTradeThreshold(ticker);
  const isLargeTrade = size >= largeTradeThreshold;

  return {
    // OHLCV
    open: price,
    high: price,
    low: price,
    close: price,
    volume: size,

    // Aggressive order flow
    askVolume: isAsk ? size : 0,
    bidVolume: isBid ? size : 0,
    unknownSideVolume: !isAsk && !isBid ? size : 0,

    // Passive order flow (book depth)
    sumBidDepth: bidSize || 0,
    sumAskDepth: askSize || 0,

    // Spread tracking (kept in raw state for potential future use)
    sumSpread: spread,
    sumMidPrice: midPrice,

    // VWAP tracking (kept in raw state for potential future use)
    sumPriceVolume: price * size,

    // Large trade detection
    maxTradeSize: size,
    largeTradeCount: isLargeTrade ? 1 : 0,
    largeTradeVolume: isLargeTrade ? size : 0,

    symbol,
    tradeCount: 1,

    // metricsOHLC will be initialized by updateCandleCvdOHLC
  };
}

/**
 * Update an existing candle with a new trade
 *
 * @param candle - The existing candle state to update
 * @param trade - The trade to add to the candle
 */
export function updateCandleWithTrade(candle: CandleState, trade: NormalizedTrade): void {
  const { price, size, isAsk, isBid, symbol, bidPrice, askPrice, bidSize, askSize, ticker } = trade;

  // Calculate spread and midpoint for this trade
  // Use Math.abs() because in crossed/inverted markets bid can exceed ask
  const spread = askPrice > 0 && bidPrice > 0 ? Math.abs(askPrice - bidPrice) : 0;
  const midPrice = askPrice > 0 && bidPrice > 0 ? (askPrice + bidPrice) / 2 : price;

  // Check if this is a large trade
  const largeTradeThreshold = getLargeTradeThreshold(ticker);
  const isLargeTrade = size >= largeTradeThreshold;

  // OHLCV
  candle.high = Math.max(candle.high, price);
  candle.low = Math.min(candle.low, price);
  candle.close = price;
  candle.volume += size;
  candle.symbol = symbol;
  candle.tradeCount++;

  // Aggressive order flow
  if (isAsk) candle.askVolume += size;
  else if (isBid) candle.bidVolume += size;
  else candle.unknownSideVolume += size;

  // Passive order flow (book depth)
  candle.sumBidDepth += bidSize || 0;
  candle.sumAskDepth += askSize || 0;

  // Spread tracking
  candle.sumSpread += spread;
  candle.sumMidPrice += midPrice;

  // VWAP tracking
  candle.sumPriceVolume += price * size;

  // Large trade detection
  candle.maxTradeSize = Math.max(candle.maxTradeSize, size);
  if (isLargeTrade) {
    candle.largeTradeCount++;
    candle.largeTradeVolume += size;
  }
}

/**
 * Update CVD OHLC tracking after a trade has been added.
 *
 * Only CVD needs intra-minute OHLC tracking because it's a running total
 * that evolves trade-by-trade. All other metrics use their final values
 * calculated at flush time.
 *
 * @param candle - The candle state (must have trade data already added)
 * @param context - Context with base CVD from the aggregator
 */
export function updateCandleCvdOHLC(
  candle: CandleState,
  context: MetricCalculationContext
): void {
  const { baseCvd } = context;

  // Calculate current CVD
  const vd = calculateVd(candle.askVolume, candle.bidVolume);
  const cvd = baseCvd + vd;

  // Store current CVD in candle for later use
  candle.currentCvd = cvd;

  // Initialize or update CVD OHLC
  if (!candle.metricsOHLC) {
    candle.metricsOHLC = initCvdOHLC(cvd);
  } else {
    updateCvdOHLC(candle.metricsOHLC, cvd);
  }
}
