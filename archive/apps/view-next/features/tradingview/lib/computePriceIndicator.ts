import { LineData, Time } from 'lightweight-charts'
import { smoothedMovingAverage } from './indicators/smoothedMovingAverage'
import { exponentialMovingAverage } from './indicators/exponentialMovingAverage'

/**
 * Compute the price indicator from price average data
 *
 * This is the main entry point for price indicator computation.
 * Expand this function to add more sophisticated indicator logic.
 *
 * @param priceAverage - The aggregated price average data
 * @param previousIndicator - Previously calculated indicator (for incremental updates)
 * @returns The computed indicator series
 */
export function computePriceIndicator(
  priceAverage: LineData<Time>[] | null,
  previousIndicator: LineData<Time>[] | null = null
): LineData<Time>[] | null {
  // Currently uses a 200-period Exponential Moving Average (EMA)
  // EMA gives more weight to recent prices, making it more responsive than SMA
  // Supports incremental calculation for real-time updates
  return exponentialMovingAverage(priceAverage, 1000, previousIndicator)
}
