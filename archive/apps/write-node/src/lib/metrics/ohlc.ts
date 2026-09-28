/**
 * OHLC (Open, High, Low, Close) tracking for CVD
 *
 * Only CVD retains OHLC tracking because it's a running total that
 * evolves meaningfully within a candle. All other metrics use their
 * final (close) value only.
 *
 * - Open: First calculated value in the minute (only set once)
 * - High: Maximum value seen during the minute
 * - Low: Minimum value seen during the minute
 * - Close: Most recent value (continuously updated)
 */

/**
 * OHLC values for a single metric
 */
export interface MetricOHLC {
  /** First value in the minute (set once on first calculation) */
  open: number;
  /** Highest value seen during the minute */
  high: number;
  /** Lowest value seen during the minute */
  low: number;
  /** Most recent value (updated on every calculation) */
  close: number;
}

/**
 * Initialize a new MetricOHLC with the first value
 * @param value - The initial value
 */
export function initMetricOHLC(value: number): MetricOHLC {
  return {
    open: value,
    high: value,
    low: value,
    close: value,
  };
}

/**
 * Update a MetricOHLC with a new value
 * - Open remains unchanged (already set)
 * - High updates if new value is higher
 * - Low updates if new value is lower
 * - Close always updates to new value
 *
 * @param ohlc - Existing OHLC to update
 * @param value - New value to incorporate
 */
export function updateMetricOHLC(ohlc: MetricOHLC, value: number): void {
  ohlc.high = Math.max(ohlc.high, value);
  ohlc.low = Math.min(ohlc.low, value);
  ohlc.close = value;
}

/**
 * OHLC tracking for CVD only.
 *
 * Other metrics (vd, vdRatio, bookImbalance, pricePct) are stored
 * as single close values calculated at flush time from the candle's
 * raw aggregation state. divergence, trades, big_trades, big_volume,
 * max_trade_size are also single values.
 */
export interface MetricsOHLC {
  /** Cumulative Volume Delta OHLC */
  cvd: MetricOHLC;
}

/**
 * Initialize CVD OHLC with the first value
 */
export function initCvdOHLC(cvd: number): MetricsOHLC {
  return {
    cvd: initMetricOHLC(cvd),
  };
}

/**
 * Update CVD OHLC with a new value
 */
export function updateCvdOHLC(ohlc: MetricsOHLC, cvd: number): void {
  updateMetricOHLC(ohlc.cvd, cvd);
}
