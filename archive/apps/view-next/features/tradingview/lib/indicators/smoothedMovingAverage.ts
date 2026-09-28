import { LineData, Time } from 'lightweight-charts'

/**
 * Compute a Smoothed Moving Average (SMMA) from LineData
 *
 * SMMA formula: SMMA(t) = (Price(t) - SMMA(t-1)) / period + SMMA(t-1)
 * Equivalent to: SMMA(t) = Price(t) * (1/period) + SMMA(t-1) * (1 - 1/period)
 *
 * SMMA is similar to EMA but uses a smaller multiplier (1/period vs 2/(period+1)),
 * making it smoother and slower to react to price changes.
 *
 * Supports incremental calculation: if previousSMMA is provided and the new data
 * contains the same historical points plus new ones, only calculates SMMA for new points.
 *
 * @param data - The source data (e.g., strengthAverage)
 * @param period - Number of periods for the SMMA (e.g., 200)
 * @param previousSMMA - Previously calculated SMMA (for incremental updates)
 * @returns SMMA data with same time points, null for insufficient data
 */
export function smoothedMovingAverage(
  data: LineData<Time>[] | null,
  period: number,
  previousSMMA: LineData<Time>[] | null = null
): LineData<Time>[] | null {
  if (!data || data.length === 0) return null

  // Need at least 'period' points to start calculating SMMA
  if (data.length < period) {
    // Return null values for all points when insufficient data
    return data.map((point) => ({
      time: point.time,
      value: 0,
    }))
  }

  const multiplier = 1 / period

  // Check if we can do incremental update
  if (
    previousSMMA &&
    previousSMMA.length > 0 &&
    previousSMMA.length < data.length
  ) {
    // Verify that historical data matches (check last timestamp of previous matches current data)
    const prevLastIdx = previousSMMA.length - 1
    const prevLastTime = previousSMMA[prevLastIdx]?.time
    const currentMatchingTime = data[prevLastIdx]?.time

    if (prevLastTime === currentMatchingTime) {
      // Historical data matches - do incremental calculation
      // Copy all previous SMMA values
      const result = [...previousSMMA]

      // Get the last calculated SMMA value
      let smma = previousSMMA[prevLastIdx]!.value

      // Only calculate SMMA for new points
      for (let i = previousSMMA.length; i < data.length; i++) {
        smma = data[i]!.value * multiplier + smma * (1 - multiplier)
        result.push({
          time: data[i]!.time,
          value: smma,
        })
      }

      return result
    }
  }

  // Full calculation (initial load or data changed)
  const result: LineData<Time>[] = []

  // Calculate initial SMA for the first 'period' points to seed the SMMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i]!.value
  }
  const initialSMA = sum / period

  // First SMMA value (at index period-1) is the SMA
  let smma = initialSMA

  // Add null values for points before we have enough data
  for (let i = 0; i < period - 1; i++) {
    result.push({
      time: data[i]!.time,
      value: 0,
    })
  }

  // Add the first SMMA point (using SMA as seed)
  result.push({
    time: data[period - 1]!.time,
    value: smma,
  })

  // Calculate SMMA for remaining points
  for (let i = period; i < data.length; i++) {
    smma = data[i]!.value * multiplier + smma * (1 - multiplier)
    result.push({
      time: data[i]!.time,
      value: smma,
    })
  }

  return result
}
