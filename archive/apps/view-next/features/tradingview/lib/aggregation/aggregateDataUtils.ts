/**
 * Data processing utilities for charts
 *
 * This module provides shared utilities for:
 * - Timestamp extraction and forward-filling
 * - Data normalization for multi-ticker comparison
 * - Future data extension for chart display
 */

import { LineData, Time } from 'lightweight-charts'

// ============================================================================
// TIMESTAMP UTILITIES
// ============================================================================

/**
 * Generate future timestamps at 1-minute intervals
 * @param lastTimestamp - The last timestamp from the real data (in seconds)
 * @param hours - Number of hours to extend into the future
 * @returns Array of future timestamps at 1-minute intervals (in seconds)
 */
export function generateFutureTimestamps(
  lastTimestamp: number,
  hours: number = 12
): number[] {
  const futureTimestamps: number[] = []
  const intervalSeconds = 1 * 60 // 1 minute in seconds
  const totalIntervals = hours * 60 // Total number of 1-minute intervals

  for (let i = 1; i <= totalIntervals; i++) {
    futureTimestamps.push(lastTimestamp + i * intervalSeconds)
  }

  return futureTimestamps
}

/**
 * Extend LineData array into the future with the last known value.
 * This creates a flat line extending from the last data point.
 *
 * @param lineData - Original LineData array
 * @param hours - Number of hours to extend (default: 12)
 * @returns New LineData array with future points appended
 */
export function extendDataIntoFuture(
  lineData: LineData[],
  hours: number = 12
): LineData[] {
  if (lineData.length === 0) return lineData

  const result = [...lineData]
  const lastDataPoint = result[result.length - 1]!
  const lastTimestamp = lastDataPoint.time as number
  const lastValue = lastDataPoint.value

  // Generate future timestamps
  const futureTimestamps = generateFutureTimestamps(lastTimestamp, hours)

  // Add future data points with the last known value
  futureTimestamps.forEach((timestamp) => {
    result.push({
      time: timestamp as Time,
      value: lastValue,
    })
  })

  return result
}

/**
 * Forward-fill missing values in price data
 * Uses aggressive interpolation to fill all timestamps with the most recent valid value
 */
export function forwardFillData<
  T extends { timestamp: number; value?: number },
>(data: T[], sortedTimestamps: number[]): Map<number, number> {
  const filledData = new Map<number, number>()

  // First pass: collect all valid values by timestamp
  const validDataByTimestamp = new Map<number, number>()
  data.forEach((item) => {
    if (
      item.value !== null &&
      item.value !== undefined &&
      item.value !== 0 &&
      Number.isFinite(item.value)
    ) {
      validDataByTimestamp.set(item.timestamp, item.value)
    }
  })

  // Second pass: aggressively fill ALL timestamps
  let previousValue: number | null = null

  for (let i = 0; i < sortedTimestamps.length; i++) {
    const timestamp = sortedTimestamps[i]!
    const existingValue = validDataByTimestamp.get(timestamp)

    if (existingValue !== undefined) {
      // We have a valid value at this timestamp
      filledData.set(timestamp, existingValue)
      previousValue = existingValue
    } else {
      // Missing value - need to fill
      let filledValue: number | null = null

      // Look backward for the most recent valid value
      if (previousValue !== null) {
        filledValue = previousValue
      } else {
        // No previous value yet, look forward
        for (let j = i + 1; j < sortedTimestamps.length; j++) {
          const futureValue = validDataByTimestamp.get(sortedTimestamps[j]!)
          if (futureValue !== undefined) {
            filledValue = futureValue
            break
          }
        }
      }

      // If we found a value to use, set it
      if (filledValue !== null) {
        filledData.set(timestamp, filledValue)
        // Don't update previousValue here as it's not a "real" value
      }
    }
  }

  return filledData
}

/**
 * Extract all unique timestamps from multiple data arrays
 * IMPORTANT: Timestamps should be at 1-minute intervals with no seconds
 */
export function extractGlobalTimestamps<T extends { timenow: Date }>(
  allData: (T[] | null)[]
): number[] {
  const globalTimestamps = new Set<number>()
  const invalidTimestamps: string[] = []

  allData.forEach((data) => {
    if (data && data.length > 0) {
      data.forEach((item) => {
        const date = new Date(item.timenow)
        const timestamp = date.getTime() / 1000

        // Validate timestamp has no seconds (1-minute intervals)
        const seconds = date.getSeconds()
        if (seconds !== 0) {
          invalidTimestamps.push(date.toISOString())
        }

        globalTimestamps.add(timestamp)
      })
    }
  })

  if (invalidTimestamps.length > 0) {
    console.warn('[extractGlobalTimestamps] Found invalid timestamps:', {
      count: invalidTimestamps.length,
      samples: invalidTimestamps.slice(0, 5),
    })
  }

  return Array.from(globalTimestamps).sort((a, b) => a - b)
}

/**
 * @deprecated Use processTickersForNormalization in aggregatePriceData.ts instead.
 * This function is kept for backwards compatibility but is no longer used by main aggregation.
 *
 * Normalize price data across multiple tickers
 * Each ticker's prices are normalized relative to its last valid price
 * This allows tickers with different price levels to be compared equally
 */
export function normalizeMultipleTickerData(
  tickersData: Array<{
    filledPrices: Map<number, number>
    lastValidPrice: number
    hasAnyData: boolean
  }>,
  sortedTimestamps: number[]
): { time: number; value: number }[] {
  // Filter to only tickers with data
  const tickersWithData = tickersData.filter((t) => t.hasAnyData)

  if (tickersWithData.length === 0) {
    return []
  }

  // Calculate normalization factors based on last valid prices
  // Each ticker's prices will be normalized relative to its last price
  // This makes each ticker contribute equally regardless of absolute price level
  const normalizationFactors = tickersWithData.map((ticker) => {
    // Avoid division by zero
    if (ticker.lastValidPrice === 0) return 0
    // Normalize so that each ticker's last price becomes 1.0
    return 1 / ticker.lastValidPrice
  })

  // Create normalized and averaged result
  const result: { time: number; value: number }[] = []

  sortedTimestamps.forEach((timestamp) => {
    let normalizedSum = 0
    let validCount = 0

    tickersWithData.forEach((ticker, idx) => {
      const price = ticker.filledPrices.get(timestamp)
      if (price !== undefined && Number.isFinite(price)) {
        // Normalize the price relative to its last value
        const normalizedPrice = price * normalizationFactors[idx]!
        normalizedSum += normalizedPrice
        validCount++
      }
    })

    // Calculate average of normalized values
    // Each normalized ticker now has its last price = 1.0
    // So the average represents the relative movement of all tickers
    if (validCount > 0) {
      const averageNormalized = normalizedSum / validCount

      // Scale back to a meaningful price range
      // We use the average of all last prices as the reference point
      const avgLastPrice =
        tickersWithData.reduce((sum, t) => sum + t.lastValidPrice, 0) /
        tickersWithData.length
      const scaledValue = averageNormalized * avgLastPrice

      result.push({
        time: timestamp,
        value: scaledValue,
      })
    }
  })

  return result
}

/**
 * Forward-fill missing values for strength data aggregation
 * Similar to forwardFillData but handles strength data aggregation structure
 */
export function aggregateStrengthDataWithInterpolation<
  T extends { timenow: Date },
>(
  allRawData: (T[] | null)[],
  sortedTimestamps: number[],
  getStrengthValue: (item: T, intervals: string[]) => number | null,
  controlIntervals: string[]
): { time: number; value: number }[] {
  // Create a map to store aggregated values by timestamp
  const aggregatedMap = new Map<number, { sum: number; count: number }>()

  // Track interpolated data for each ticker
  const tickerInterpolatedData: Map<number, number>[] = []
  let tickersWithData = 0
  let totalDataPoints = 0

  // Process each ticker's data
  allRawData.forEach((tickerData, tickerIndex) => {
    if (!tickerData || tickerData.length === 0) {
      tickerInterpolatedData[tickerIndex] = new Map()
      return
    }
    tickersWithData++

    // Convert ticker data to timestamp/value pairs for interpolation
    // Skip entries where ALL interval values are null (empty pre-created rows)
    const tickerValues = tickerData
      .map((item) => {
        const value = getStrengthValue(item, controlIntervals)
        // Only include if we have actual data (not empty pre-created rows)
        if (value === null || value === 0) {
          // Check if this is an empty row (all strength values are null)
          const hasAnyData = controlIntervals.some(
            (interval) =>
              item[interval as keyof typeof item] !== null &&
              item[interval as keyof typeof item] !== undefined
          )
          if (!hasAnyData) {
            return null // Skip empty pre-created rows
          }
        }
        return {
          timestamp: new Date(item.timenow).getTime() / 1000,
          value,
        }
      })
      .filter((item) => item !== null && item.value !== null) as Array<{
      timestamp: number
      value: number
    }>

    // Apply forward-fill interpolation
    const filledData = forwardFillData(tickerValues, sortedTimestamps)
    tickerInterpolatedData[tickerIndex] = filledData

    totalDataPoints += tickerValues.length

    // Add interpolated values to aggregated map
    filledData.forEach((value, timestamp) => {
      if (!aggregatedMap.has(timestamp)) {
        aggregatedMap.set(timestamp, { sum: 0, count: 0 })
      }

      const existing = aggregatedMap.get(timestamp)!
      existing.sum += value
      existing.count++
    })
  })

  // Convert map to sorted result array
  const result: { time: number; value: number }[] = []
  aggregatedMap.forEach((value, timestamp) => {
    if (value.count > 0) {
      result.push({
        time: timestamp,
        value: value.sum / value.count,
      })
    }
  })

  // Sort by time
  const sorted = result.sort((a, b) => a.time - b.time)

  return sorted
}

