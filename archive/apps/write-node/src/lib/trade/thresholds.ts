/**
 * Large Trade Detection Thresholds
 *
 * Per-instrument thresholds for detecting institutional-sized trades.
 */

/**
 * Per-instrument thresholds for "large" trade detection.
 * Trades >= this size are counted and tracked separately.
 *
 * These thresholds are based on CME block trade minimums and typical
 * institutional activity levels. Trades at or above these sizes often
 * indicate institutional positioning or algorithmic execution.
 *
 * Sources:
 * - CME Block Trade Minimum for ES: 25 contracts
 * - Typical retail: 1-10 contracts
 * - Institutional: 25-100+ contracts
 */
export const LARGE_TRADE_THRESHOLDS: Record<string, number> = {
  // E-mini S&P 500 - CME block minimum is 25
  ES: 25,
  // E-mini Nasdaq-100 - CME block minimum is 25
  NQ: 25,
  // E-mini Russell 2000 - CME block minimum is 25
  RTY: 25,
  // E-mini Dow - CME block minimum is 25
  YM: 25,
  // Crude Oil - CME block minimum is 25
  CL: 25,
  // Gold - CME block minimum is 25
  GC: 25,
  // Silver - CME block minimum is 25
  SI: 25,
  // Copper (HG) - CME block minimum is 25
  HG: 25,
  // Natural Gas - higher threshold due to different market dynamics
  NG: 50,
  // Default for unknown instruments
  DEFAULT: 25,
};

/**
 * Get the large trade threshold for a given ticker
 * @param ticker - Parent ticker (e.g., "ES", "NQ")
 * @returns Threshold in contracts
 */
export function getLargeTradeThreshold(ticker: string): number {
  return LARGE_TRADE_THRESHOLDS[ticker] ?? LARGE_TRADE_THRESHOLDS.DEFAULT;
}
