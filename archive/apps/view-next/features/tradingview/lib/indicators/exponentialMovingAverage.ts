import { LineData, Time } from 'lightweight-charts'

/**
 * Compute an Exponential Moving Average (EMA) from LineData
 *
 * EMA formula: EMA(t) = Price(t) * multiplier + EMA(t-1) * (1 - multiplier)
 * where multiplier = 2 / (period + 1)
 *
 * Supports incremental calculation: if previousEMA is provided and the new data
 * contains the same historical points plus new ones, only calculates EMA for new points.
 *
 * @param data - The source data (e.g., strengthAverage)
 * @param period - Number of periods for the EMA (e.g., 200)
 * @param previousEMA - Previously calculated EMA (for incremental updates)
 * @returns EMA data with same time points, null for insufficient data
 */
export function exponentialMovingAverage(
  data: LineData<Time>[] | null,
  period: number,
  previousEMA: LineData<Time>[] | null = null
): LineData<Time>[] | null {
  if (!data || data.length === 0) return null

  // Need at least 'period' points to start calculating EMA
  if (data.length < period) {
    // Return null values for all points when insufficient data
    return data.map((point) => ({
      time: point.time,
      value: 0, // Will be filtered out by chart or shown as no line
    }))
  }

  const multiplier = 2 / (period + 1)

  // Check if we can do incremental update
  if (
    previousEMA &&
    previousEMA.length > 0 &&
    previousEMA.length < data.length
  ) {
    // Verify that historical data matches (check last timestamp of previous matches current data)
    const prevLastIdx = previousEMA.length - 1
    const prevLastTime = previousEMA[prevLastIdx]?.time
    const currentMatchingTime = data[prevLastIdx]?.time

    if (prevLastTime === currentMatchingTime) {
      // Historical data matches - do incremental calculation
      // Copy all previous EMA values
      const result = [...previousEMA]

      // Get the last calculated EMA value
      let ema = previousEMA[prevLastIdx]!.value

      // Only calculate EMA for new points
      for (let i = previousEMA.length; i < data.length; i++) {
        ema = data[i]!.value * multiplier + ema * (1 - multiplier)
        result.push({
          time: data[i]!.time,
          value: ema,
        })
      }

      return result
    }
  }

  // Full calculation (initial load or data changed)
  const result: LineData<Time>[] = []

  // Calculate initial SMA for the first 'period' points to seed the EMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i]!.value
  }
  const initialSMA = sum / period

  // First EMA value (at index period-1) is the SMA
  let ema = initialSMA

  // Add null values for points before we have enough data
  for (let i = 0; i < period - 1; i++) {
    result.push({
      time: data[i]!.time,
      value: 0, // Placeholder, will render as gap in chart
    })
  }

  // Add the first EMA point (using SMA as seed)
  result.push({
    time: data[period - 1]!.time,
    value: ema,
  })

  // Calculate EMA for remaining points
  for (let i = period; i < data.length; i++) {
    ema = data[i]!.value * multiplier + ema * (1 - multiplier)
    result.push({
      time: data[i]!.time,
      value: ema,
    })
  }

  return result
}
