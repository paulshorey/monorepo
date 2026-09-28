/**
 * Type definitions for TBBO streaming and candle aggregation
 */

import type { MetricsOHLC } from "../metrics/ohlc.js";

/**
 * Raw TBBO (Trade with Best Bid/Offer) record from Databento
 */
export interface TbboRecord {
  /** Nanosecond epoch timestamp as string (e.g., "1768275460711927889") */
  timestamp: string;
  /** Specific contract symbol (e.g., "ESH5") */
  symbol: string;
  /** Trade price */
  price: number;
  /** Trade size/volume */
  size: number;
  /** Trade side: 'A' (ask) = aggressive buy, 'B' (bid) = aggressive sell, 'N' = unknown */
  side: string;
  /** Best bid price at time of trade */
  bidPrice: number;
  /** Best ask price at time of trade */
  askPrice: number;
  /** Best bid size */
  bidSize: number;
  /** Best ask size */
  askSize: number;
}

/**
 * Internal state for an in-progress candle being aggregated
 */
export interface CandleState {
  // OHLCV (price)
  open: number;
  high: number;
  low: number;
  close: number;
  /** Total volume */
  volume: number;

  // Volume Delta tracking (aggressive order flow)
  /** Volume from trades at ask (side='A') = aggressive buying */
  askVolume: number;
  /** Volume from trades at bid (side='B') = aggressive selling */
  bidVolume: number;
  /** Volume from trades with unknown/undetermined side */
  unknownSideVolume: number;

  // Book Imbalance tracking (passive order flow)
  /** Sum of bidSize at each trade (for averaging passive bid depth) */
  sumBidDepth: number;
  /** Sum of askSize at each trade (for averaging passive ask depth) */
  sumAskDepth: number;

  // Spread tracking (liquidity measure)
  /** Sum of (askPrice - bidPrice) at each trade (for average spread) */
  sumSpread: number;
  /** Sum of midPrice at each trade (for spread normalization) */
  sumMidPrice: number;

  // VWAP tracking
  /** Sum of (price * size) for each trade (for VWAP calculation) */
  sumPriceVolume: number;

  // Large trade detection
  /** Largest single trade size in this candle */
  maxTradeSize: number;
  /** Number of trades >= large trade threshold */
  largeTradeCount: number;
  /** Total volume from large trades */
  largeTradeVolume: number;

  /** Most recent contract symbol (for tracking active contract) */
  symbol: string;
  /** Number of trades in this candle */
  tradeCount: number;

  // =========================================================================
  // Metric OHLC Tracking
  // =========================================================================

  /**
   * OHLC tracking for metrics that evolve trade-by-trade.
   * Today this is only used for CVD.
   * Undefined until first trade is processed and the metric is initialized.
   */
  metricsOHLC?: MetricsOHLC;

  /**
   * Current CVD value for this candle (base CVD + accumulated VD).
   * This is needed to calculate CVD OHLC as trades come in.
   * Set from the aggregator's running CVD total.
   */
  currentCvd?: number;

}

/**
 * Candle data prepared for database write
 */
export interface CandleForDb {
  key: string;
  ticker: string;
  time: string;
  candle: CandleState;
}

/**
 * Aggregator statistics for monitoring
 */
export interface AggregatorStats {
  recordsProcessed: number;
  pendingCandles: number;
  candlesWritten: number;
  lateTradesRejected: number;
  unknownSideTrades: number;
  syntheticSecondsFilled: number;
  gapResets: number;
  outOfOrderTradesIgnored: number;
  skippedNonFront: number;
  activeContracts: Record<string, string>;
  cvdByTicker: Record<string, number>;
}

/**
 * Trade data normalized for candle aggregation
 * Used by both streaming and historical processing
 */
export interface NormalizedTrade {
  ticker: string;
  price: number;
  size: number;
  isAsk: boolean;
  isBid: boolean;
  symbol: string;
  bidPrice: number;
  askPrice: number;
  bidSize: number;
  askSize: number;
}

/**
 * Context needed to calculate metrics during candle aggregation.
 * Provided by the aggregator which tracks state across candles.
 */
export interface MetricCalculationContext {
  /** Current CVD value before this candle's VD is added */
  baseCvd: number;
}
