import { LineData, Time } from 'lightweight-charts'
import { smoothedMovingAverage } from './indicators/smoothedMovingAverage'
import { exponentialMovingAverage } from './indicators/exponentialMovingAverage'

/**
 * Compute the strength indicator from strength average data
 *
 * This is the main entry point for indicator computation.
 * Expand this function to add more sophisticated indicator logic.
 *
 * @param strengthAverage - The aggregated strength average data
 * @param previousIndicator - Previously calculated indicator (for incremental updates)
 * @returns The computed indicator series
 */
export function computeStrengthIndicator(
  strengthAverage: LineData<Time>[] | null,
  previousIndicator: LineData<Time>[] | null = null
): LineData<Time>[] | null {
  // Currently uses a 200-period Exponential Moving Average (EMA)
  // EMA gives more weight to recent prices, making it more responsive than SMA
  // Supports incremental calculation for real-time updates
  return smoothedMovingAverage(strengthAverage, 1000, previousIndicator)
}
