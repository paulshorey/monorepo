/**
 * Price Metrics: price_pct
 *
 * Normalized price metrics for cross-instrument comparison.
 */

/**
 * Calculate normalized price change as percentage
 *
 * Price Pct = ((close - open) / open) * 10000
 *
 * Returns price change in basis points (1 bp = 0.01%):
 * - 100 = 1% price increase
 * - -50 = 0.5% price decrease
 *
 * Using basis points provides cross-instrument comparability:
 * ES at 5000 and CL at 70 can be directly compared.
 *
 * @param priceOpen - Opening price of the candle
 * @param priceClose - Closing price of the candle
 * @returns Price change in basis points, or 0 if open is 0
 */
export function calculatePricePct(priceOpen: number, priceClose: number): number {
  if (priceOpen === 0) return 0;
  return ((priceClose - priceOpen) / priceOpen) * 10000;
}
