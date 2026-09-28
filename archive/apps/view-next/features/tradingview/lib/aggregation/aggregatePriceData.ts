import { StrengthRowGet } from '@lib/db-trading/sql/strength'
import { LineData, Time } from 'lightweight-charts'
import {
  extractGlobalTimestamps,
  forwardFillData,
  generateFutureTimestamps,
  extendDataIntoFuture,
} from './aggregateDataUtils'
import { PriceTickersData } from '../../state/useChartControlsStore'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Processed ticker data with normalization info
 */
interface ProcessedTicker {
  ticker: string
  filledPrices: Map<number, number>
  lastValidPrice: number
  hasAnyData: boolean
}

/**
 * Shared normalization context for consistent price scaling
 */
interface NormalizationContext {
  /** Average of all tickers' last valid prices */
  avgLastPrice: number
  /** Map of ticker -> normalization factor (1 / lastPrice) */
  normalizationFactors: Map<string, number>
  /** Processed ticker data */
  processedTickers: ProcessedTicker[]
  /** Global sorted timestamps */
  sortedTimestamps: number[]
}

// ============================================================================
// CORE PROCESSING
// ============================================================================

/**
 * Process all raw ticker data and compute shared normalization context.
 * This ensures consistent normalization across aggregated and individual price lines.
 *
 * @param allRawData - Raw data from all tickers
 * @param tickers - Ticker symbols (in same order as allRawData)
 * @param allMarketData - Optional: all market data for consistent timestamps
 * @returns Normalization context with processed data
 */
function processTickersForNormalization(
  allRawData: (StrengthRowGet[] | null)[],
  tickers: string[],
  allMarketData?: (StrengthRowGet[] | null)[]
): NormalizationContext | null {
  // Extract all unique timestamps from ALL market data to ensure consistency
  const dataForTimestamps = allMarketData || allRawData
  const sortedTimestamps = extractGlobalTimestamps(dataForTimestamps)

  if (sortedTimestamps.length === 0) {
    return null
  }

  const processedTickers: ProcessedTicker[] = []
  const normalizationFactors = new Map<string, number>()

  // Process each ticker
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

    // Convert ticker data to timestamp/value pairs for interpolation
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

    // Apply forward-fill interpolation
    const interpolatedPrices = forwardFillData(tickerPrices, sortedTimestamps)

    // Get the last filled price for normalization
    const lastFilledPrice =
      interpolatedPrices.get(sortedTimestamps[sortedTimestamps.length - 1]!) ||
      tickerPrices[tickerPrices.length - 1]!.value

    processedTickers.push({
      ticker,
      filledPrices: interpolatedPrices,
      lastValidPrice: lastFilledPrice,
      hasAnyData: true,
    })

    // Calculate normalization factor (1 / lastPrice)
    // This makes each ticker's last price = 1.0 when normalized
    normalizationFactors.set(
      ticker,
      lastFilledPrice > 0 ? 1 / lastFilledPrice : 0
    )
  })

  // Calculate average of all last prices (only from tickers with valid data)
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

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Aggregate price data from all tickers with normalization.
 * Creates a single chart data series that averages normalized price values.
 *
 * Normalization ensures each ticker contributes equally regardless of absolute price level:
 * - Each ticker's prices are divided by its last valid price (so last = 1.0)
 * - The normalized values are averaged across all tickers
 * - The result is scaled back by the average of all tickers' last prices
 *
 * @param allRawData - Raw data from all tickers
 * @param allMarketData - Optional: all market data for consistent timestamps
 * @returns LineData array for the aggregated price line
 */
export const aggregatePriceData = (
  allRawData: (StrengthRowGet[] | null)[],
  allMarketData?: (StrengthRowGet[] | null)[]
): LineData[] => {
  // Generate ticker names (we don't need actual names for aggregation)
  const tickers = allRawData.map((_, i) => `ticker_${i}`)

  const context = processTickersForNormalization(
    allRawData,
    tickers,
    allMarketData
  )
  if (!context) return []

  const {
    avgLastPrice,
    normalizationFactors,
    processedTickers,
    sortedTimestamps,
  } = context
  const tickersWithData = processedTickers.filter((t) => t.hasAnyData)

  if (tickersWithData.length === 0) return []

  // Create normalized and averaged result
  const result: { time: number; value: number }[] = []

  sortedTimestamps.forEach((timestamp) => {
    let normalizedSum = 0
    let validCount = 0

    tickersWithData.forEach((ticker) => {
      const price = ticker.filledPrices.get(timestamp)
      const factor = normalizationFactors.get(ticker.ticker) || 0

      if (price !== undefined && Number.isFinite(price) && factor > 0) {
        // Normalize: price * (1 / lastPrice) = relative to last price
        normalizedSum += price * factor
        validCount++
      }
    })

    if (validCount > 0) {
      // Average of normalized values, scaled back to meaningful range
      const averageNormalized = normalizedSum / validCount
      const scaledValue = averageNormalized * avgLastPrice

      result.push({
        time: timestamp,
        value: scaledValue,
      })
    }
  })

  // Convert to LineData format
  const lineData = result.map((point) => ({
    time: point.time as Time,
    value: point.value,
  }))

  // Extend data 12 hours into the future
  return extendDataIntoFuture(lineData, 12)
}

/**
 * Aggregate price data for each individual ticker separately.
 * Each ticker's prices are normalized using the SAME parameters as aggregatePriceData,
 * ensuring visual consistency between the aggregated line and individual lines.
 *
 * @param allRawData - Raw data from all tickers (array in same order as tickers)
 * @param tickers - Array of ticker symbols
 * @param allMarketData - Optional: all market data for consistent timestamps
 * @returns Object mapping ticker -> LineData[] for each ticker
 */
export const aggregatePriceByTicker = (
  allRawData: (StrengthRowGet[] | null)[],
  tickers: string[],
  allMarketData?: (StrengthRowGet[] | null)[]
): PriceTickersData => {
  const context = processTickersForNormalization(
    allRawData,
    tickers,
    allMarketData
  )
  if (!context) return {}

  const {
    avgLastPrice,
    normalizationFactors,
    processedTickers,
    sortedTimestamps,
  } = context
  const result: PriceTickersData = {}

  // Process each ticker using the shared normalization context
  processedTickers.forEach((ticker) => {
    if (!ticker.hasAnyData) return

    const factor = normalizationFactors.get(ticker.ticker) || 0
    if (factor === 0) return

    // Convert to LineData format with normalization
    const lineData: LineData[] = []

    sortedTimestamps.forEach((timestamp) => {
      const price = ticker.filledPrices.get(timestamp)
      if (price !== undefined && Number.isFinite(price)) {
        // Same normalization as aggregated: price * factor * avgLastPrice
        // This ensures all lines converge to the same point at the end
        const normalizedPrice = price * factor * avgLastPrice
        lineData.push({
          time: timestamp as Time,
          value: normalizedPrice,
        })
      }
    })

    if (lineData.length > 0) {
      // Extend data 12 hours into the future
      result[ticker.ticker] = extendDataIntoFuture(lineData, 12)
    }
  })

  return result
}
