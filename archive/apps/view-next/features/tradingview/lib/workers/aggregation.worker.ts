/**
 * Aggregation Web Worker
 *
 * Performs all heavy data aggregation off the main thread.
 * This keeps the UI responsive during calculations.
 *
 * IMPORTANT: This file must be self-contained - no external imports
 * except types (which are erased at runtime).
 */

import type {
  AggregationWorkerRequest,
  AggregationWorkerResponse,
  WorkerStrengthRow,
  WorkerLineData,
} from './types'

// Use the worker-specific LineData type
type LineData = WorkerLineData

// ============================================================================
// UTILITY FUNCTIONS (inlined from aggregateDataUtils.ts)
// ============================================================================

/**
 * Generate future timestamps at 1-minute intervals
 */
function generateFutureTimestamps(
  lastTimestamp: number,
  hours: number = 12
): number[] {
  const futureTimestamps: number[] = []
  const intervalSeconds = 1 * 60
  const totalIntervals = hours * 60

  for (let i = 1; i <= totalIntervals; i++) {
    futureTimestamps.push(lastTimestamp + i * intervalSeconds)
  }

  return futureTimestamps
}

/**
 * Extend LineData array into the future with the last known value
 */
function extendDataIntoFuture(
  lineData: LineData[],
  hours: number = 12
): LineData[] {
  if (lineData.length === 0) return lineData

  const result = [...lineData]
  const lastDataPoint = result[result.length - 1]!
  const lastTimestamp = lastDataPoint.time
  const lastValue = lastDataPoint.value

  const futureTimestamps = generateFutureTimestamps(lastTimestamp, hours)

  futureTimestamps.forEach((timestamp) => {
    result.push({ time: timestamp, value: lastValue })
  })

  return result
}

/**
 * Forward-fill missing values in data
 */
function forwardFillData(
  data: Array<{ timestamp: number; value?: number }>,
  sortedTimestamps: number[]
): Map<number, number> {
  const filledData = new Map<number, number>()
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

  let previousValue: number | null = null

  for (let i = 0; i < sortedTimestamps.length; i++) {
    const timestamp = sortedTimestamps[i]!
    const existingValue = validDataByTimestamp.get(timestamp)

    if (existingValue !== undefined) {
      filledData.set(timestamp, existingValue)
      previousValue = existingValue
    } else {
      let filledValue: number | null = null

      if (previousValue !== null) {
        filledValue = previousValue
      } else {
        for (let j = i + 1; j < sortedTimestamps.length; j++) {
          const futureValue = validDataByTimestamp.get(sortedTimestamps[j]!)
          if (futureValue !== undefined) {
            filledValue = futureValue
            break
          }
        }
      }

      if (filledValue !== null) {
        filledData.set(timestamp, filledValue)
      }
    }
  }

  return filledData
}

/**
 * Extract all unique timestamps from multiple data arrays
 */
function extractGlobalTimestamps(
  allData: (WorkerStrengthRow[] | null)[]
): number[] {
  const globalTimestamps = new Set<number>()

  allData.forEach((data) => {
    if (data && data.length > 0) {
      data.forEach((item) => {
        const date = new Date(item.timenow)
        const timestamp = date.getTime() / 1000
        globalTimestamps.add(timestamp)
      })
    }
  })

  return Array.from(globalTimestamps).sort((a, b) => a - b)
}

// ============================================================================
// STRENGTH AGGREGATION (from aggregateStrengthData.ts)
// ============================================================================

function aggregateStrengthDataWithInterpolation(
  allRawData: (WorkerStrengthRow[] | null)[],
  sortedTimestamps: number[],
  getStrengthValue: (
    item: WorkerStrengthRow,
    intervals: string[]
  ) => number | null,
  controlIntervals: string[]
): { time: number; value: number }[] {
  const aggregatedMap = new Map<number, { sum: number; count: number }>()

  allRawData.forEach((tickerData) => {
    if (!tickerData || tickerData.length === 0) {
      return
    }

    const tickerValues = tickerData
      .map((item) => {
        const value = getStrengthValue(item, controlIntervals)
        if (value === null || value === 0) {
          const hasAnyData = controlIntervals.some(
            (interval) =>
              item[interval] !== null && item[interval] !== undefined
          )
          if (!hasAnyData) {
            return null
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

    const filledData = forwardFillData(tickerValues, sortedTimestamps)

    filledData.forEach((value, timestamp) => {
      if (!aggregatedMap.has(timestamp)) {
        aggregatedMap.set(timestamp, { sum: 0, count: 0 })
      }
      const existing = aggregatedMap.get(timestamp)!
      existing.sum += value
      existing.count++
    })
  })

  const result: { time: number; value: number }[] = []
  aggregatedMap.forEach((value, timestamp) => {
    if (value.count > 0) {
      result.push({
        time: timestamp,
        value: value.sum / value.count,
      })
    }
  })

  return result.sort((a, b) => a.time - b.time)
}

function aggregateStrengthData(
  allRawData: (WorkerStrengthRow[] | null)[],
  controlIntervals: string[]
): LineData[] {
  const sortedTimestamps = extractGlobalTimestamps(allRawData)

  if (sortedTimestamps.length === 0) {
    return []
  }

  const getStrengthValue = (
    item: WorkerStrengthRow,
    intervals: string[]
  ): number | null => {
    let sum = 0
    let count = 0

    for (const interval of intervals) {
      const value = item[interval]
      if (value !== null && value !== undefined) {
        const numericValue =
          typeof value === 'string' ? parseFloat(value) : Number(value)
        if (Number.isFinite(numericValue)) {
          sum += numericValue
          count++
        }
      }
    }

    return count > 0 ? sum / count : null
  }

  const result = aggregateStrengthDataWithInterpolation(
    allRawData,
    sortedTimestamps,
    getStrengthValue,
    controlIntervals
  )

  const lineData = result.map((point) => ({
    time: point.time,
    value: point.value,
  }))

  return extendDataIntoFuture(lineData, 12)
}

/**
 * OPTIMIZED: Process all intervals in a single pass through the data
 *
 * Old approach: For each interval, iterate through all data and forward-fill
 * New approach: Single pass extracts ALL interval values, forward-fill once per ticker
 *
 * With 7 intervals and 2 tickers:
 * - Old: 14 forward-fill operations
 * - New: 2 forward-fill operations (one per ticker, handling all intervals)
 */
function aggregateStrengthByInterval(
  allRawData: (WorkerStrengthRow[] | null)[],
  selectedIntervals: string[],
  _strengthIntervals: string[]
): Record<string, LineData[]> {
  const sortedTimestamps = extractGlobalTimestamps(allRawData)

  if (sortedTimestamps.length === 0 || selectedIntervals.length === 0) {
    return {}
  }

  // Create a timestamp set for O(1) lookup
  const timestampSet = new Set(sortedTimestamps)

  // Initialize aggregation maps for each interval
  // Map<interval, Map<timestamp, { sum, count }>>
  const intervalAggregates = new Map<
    string,
    Map<number, { sum: number; count: number }>
  >()
  for (const interval of selectedIntervals) {
    intervalAggregates.set(interval, new Map())
  }

  // Process each ticker ONCE, extracting ALL interval values in a single pass
  for (const tickerData of allRawData) {
    if (!tickerData || tickerData.length === 0) continue

    // Extract raw values for all intervals from this ticker
    // Map<interval, Map<timestamp, value>>
    const intervalValues = new Map<string, Map<number, number>>()
    for (const interval of selectedIntervals) {
      intervalValues.set(interval, new Map())
    }

    // Single pass through ticker data to extract all interval values
    for (const item of tickerData) {
      const timestamp = new Date(item.timenow).getTime() / 1000

      for (const interval of selectedIntervals) {
        const value = item[interval]
        if (value !== null && value !== undefined) {
          const numericValue =
            typeof value === 'string' ? parseFloat(value) : Number(value)
          if (Number.isFinite(numericValue)) {
            intervalValues.get(interval)!.set(timestamp, numericValue)
          }
        }
      }
    }

    // Forward-fill each interval's values (still need to do this per interval,
    // but we're reading from cached values, not re-parsing the data)
    for (const interval of selectedIntervals) {
      const rawValues = intervalValues.get(interval)!
      const aggregateMap = intervalAggregates.get(interval)!

      // Forward-fill this interval's values
      let previousValue: number | null = null

      for (const timestamp of sortedTimestamps) {
        let value = rawValues.get(timestamp)

        if (value !== undefined) {
          previousValue = value
        } else if (previousValue !== null) {
          value = previousValue
        }

        if (value !== undefined) {
          const existing = aggregateMap.get(timestamp)
          if (existing) {
            existing.sum += value
            existing.count++
          } else {
            aggregateMap.set(timestamp, { sum: value, count: 1 })
          }
        }
      }
    }
  }

  // Build results
  const result: Record<string, LineData[]> = {}

  for (const interval of selectedIntervals) {
    const aggregateMap = intervalAggregates.get(interval)!
    const lineData: LineData[] = []

    for (const timestamp of sortedTimestamps) {
      const agg = aggregateMap.get(timestamp)
      if (agg && agg.count > 0) {
        lineData.push({
          time: timestamp,
          value: agg.sum / agg.count,
        })
      }
    }

    if (lineData.length > 0) {
      result[interval] = extendDataIntoFuture(lineData, 12)
    }
  }

  return result
}

// ============================================================================
// PRICE AGGREGATION (from aggregatePriceData.ts)
// ============================================================================

interface ProcessedTicker {
  ticker: string
  filledPrices: Map<number, number>
  lastValidPrice: number
  hasAnyData: boolean
}

interface NormalizationContext {
  avgLastPrice: number
  normalizationFactors: Map<string, number>
  processedTickers: ProcessedTicker[]
  sortedTimestamps: number[]
}

function processTickersForNormalization(
  allRawData: (WorkerStrengthRow[] | null)[],
  tickers: string[]
): NormalizationContext | null {
  const sortedTimestamps = extractGlobalTimestamps(allRawData)

  if (sortedTimestamps.length === 0) {
    return null
  }

  const processedTickers: ProcessedTicker[] = []
  const normalizationFactors = new Map<string, number>()

  allRawData.forEach((tickerData, index) => {
    const ticker = tickers[index] || `ticker_${index}`

    if (!tickerData || tickerData.length === 0) {
      processedTickers.push({
        ticker,
        filledPrices: new Map(),
        lastValidPrice: 0,
        hasAnyData: false,
      })
      normalizationFactors.set(ticker, 0)
      return
    }

    const tickerPrices = tickerData
      .map((item) => ({
        timestamp: new Date(item.timenow).getTime() / 1000,
        value:
          item.price !== null &&
          item.price !== undefined &&
          item.price !== 0 &&
          Number.isFinite(item.price)
            ? item.price
            : undefined,
      }))
      .filter((item) => item.value !== undefined) as Array<{
      timestamp: number
      value: number
    }>

    if (tickerPrices.length === 0) {
      processedTickers.push({
        ticker,
        filledPrices: new Map(),
        lastValidPrice: 0,
        hasAnyData: false,
      })
      normalizationFactors.set(ticker, 0)
      return
    }

    const interpolatedPrices = forwardFillData(tickerPrices, sortedTimestamps)

    const lastFilledPrice =
      interpolatedPrices.get(sortedTimestamps[sortedTimestamps.length - 1]!) ||
      tickerPrices[tickerPrices.length - 1]!.value

    processedTickers.push({
      ticker,
      filledPrices: interpolatedPrices,
      lastValidPrice: lastFilledPrice,
      hasAnyData: true,
    })

    normalizationFactors.set(
      ticker,
      lastFilledPrice > 0 ? 1 / lastFilledPrice : 0
    )
  })

  const tickersWithData = processedTickers.filter((t) => t.hasAnyData)
  const avgLastPrice =
    tickersWithData.length > 0
      ? tickersWithData.reduce((sum, t) => sum + t.lastValidPrice, 0) /
        tickersWithData.length
      : 1

  return {
    avgLastPrice,
    normalizationFactors,
    processedTickers,
    sortedTimestamps,
  }
}

function aggregatePriceData(
  allRawData: (WorkerStrengthRow[] | null)[]
): LineData[] {
  const tickers = allRawData.map((_, i) => `ticker_${i}`)

  const context = processTickersForNormalization(allRawData, tickers)
  if (!context) return []

  const {
    avgLastPrice,
    normalizationFactors,
    processedTickers,
    sortedTimestamps,
  } = context
  const tickersWithData = processedTickers.filter((t) => t.hasAnyData)

  if (tickersWithData.length === 0) return []

  const result: { time: number; value: number }[] = []

  sortedTimestamps.forEach((timestamp) => {
    let normalizedSum = 0
    let validCount = 0

    tickersWithData.forEach((ticker) => {
      const price = ticker.filledPrices.get(timestamp)
      const factor = normalizationFactors.get(ticker.ticker) || 0

      if (price !== undefined && Number.isFinite(price) && factor > 0) {
        normalizedSum += price * factor
        validCount++
      }
    })

    if (validCount > 0) {
      const averageNormalized = normalizedSum / validCount
      const scaledValue = averageNormalized * avgLastPrice

      result.push({
        time: timestamp,
        value: scaledValue,
      })
    }
  })

  const lineData = result.map((point) => ({
    time: point.time,
    value: point.value,
  }))

  return extendDataIntoFuture(lineData, 12)
}

function aggregatePriceByTicker(
  allRawData: (WorkerStrengthRow[] | null)[],
  tickers: string[]
): Record<string, LineData[]> {
  const context = processTickersForNormalization(allRawData, tickers)
  if (!context) return {}

  const {
    avgLastPrice,
    normalizationFactors,
    processedTickers,
    sortedTimestamps,
  } = context
  const result: Record<string, LineData[]> = {}

  processedTickers.forEach((ticker) => {
    if (!ticker.hasAnyData) return

    const factor = normalizationFactors.get(ticker.ticker) || 0
    if (factor === 0) return

    const lineData: LineData[] = []

    sortedTimestamps.forEach((timestamp) => {
      const price = ticker.filledPrices.get(timestamp)
      if (price !== undefined && Number.isFinite(price)) {
        const normalizedPrice = price * factor * avgLastPrice
        lineData.push({
          time: timestamp,
          value: normalizedPrice,
        })
      }
    })

    if (lineData.length > 0) {
      result[ticker.ticker] = extendDataIntoFuture(lineData, 12)
    }
  })

  return result
}

// ============================================================================
// WORKER MESSAGE HANDLER
// ============================================================================

const workerScope =
  typeof self !== 'undefined' && typeof (self as any).postMessage === 'function'
    ? (self as any)
    : null

// Guarded to avoid ReferenceError when this module is evaluated during SSR/build
if (workerScope) {
  workerScope.onmessage = (event: MessageEvent<AggregationWorkerRequest>) => {
    const startTime = performance.now()

    try {
      const { type, requestId, dataVersion, payload } = event.data

      if (type !== 'aggregate') {
        throw new Error(`Unknown message type: ${type}`)
      }

      const {
        rawData,
        intervals,
        tickers,
        strengthIntervals: strengthIntervals_all,
      } = payload

      // Perform all aggregations
      // Average strength uses selected intervals (user controls what goes into average)
      const strengthAverage = aggregateStrengthData(rawData, intervals)
      const priceAverage = aggregatePriceData(rawData)
      // Individual interval lines: compute ALL intervals (visibility controlled by UI)
      // This avoids re-aggregation when user changes interval selection
      const strengthIntervals = aggregateStrengthByInterval(
        rawData,
        strengthIntervals_all, // ALL intervals, not just selected
        strengthIntervals_all
      )
      const priceTickers = aggregatePriceByTicker(rawData, tickers)

      const processingTimeMs = performance.now() - startTime

      const response: AggregationWorkerResponse = {
        type: 'result',
        requestId, // Echo back the request ID
        dataVersion, // Echo back the data version for validation
        payload: {
          strengthAverage: strengthAverage.length > 0 ? strengthAverage : null,
          priceAverage: priceAverage.length > 0 ? priceAverage : null,
          strengthIntervals,
          priceTickers,
          processingTimeMs,
        },
      }

      workerScope.postMessage(response)
    } catch (error) {
      workerScope.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

// Export empty object to make TypeScript happy (worker files need this)
export {}
