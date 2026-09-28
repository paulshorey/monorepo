import { StrengthRowGet } from '@lib/db-trading/sql/strength'
import { LineData, Time } from 'lightweight-charts'
import {
  aggregateStrengthDataWithInterpolation,
  extractGlobalTimestamps,
  extendDataIntoFuture,
} from './aggregateDataUtils'
import {
  strengthIntervalsAll as STRENGTH_INTERVALS,
  StrengthIntervalsData,
} from '../../state/useChartControlsStore'

/**
 * Aggregate strength data from all tickers with interpolation
 * Creates a single chart data series that averages all interval values from all tickers
 * Uses forward-fill interpolation to handle missing values
 */
export const aggregateStrengthData = (
  allRawData: (StrengthRowGet[] | null)[],
  control_intervals: string[],
  allMarketData?: (StrengthRowGet[] | null)[] // Optional: all market data for consistent timestamps
): LineData[] => {
  // Extract all unique timestamps from ALL market data to ensure consistency
  // This prevents issues when switching between Average and individual tickers
  const dataForTimestamps = allMarketData || allRawData
  const sortedTimestamps = extractGlobalTimestamps(dataForTimestamps)

  if (sortedTimestamps.length === 0) {
    return []
  }

  // Helper function to extract strength value from an item
  const getStrengthValue = (
    item: StrengthRowGet,
    intervals: string[]
  ): number | null => {
    let sum = 0
    let count = 0

    for (const interval of intervals) {
      const value = item[interval as keyof StrengthRowGet]

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

  // Use the new interpolation utility
  const result = aggregateStrengthDataWithInterpolation(
    allRawData,
    sortedTimestamps,
    getStrengthValue,
    control_intervals
  )

  // Convert to LineData format - ensure we create new objects
  const lineData = result.map((point) => ({
    time: point.time as Time,
    value: point.value,
  }))

  // Extend data 12 hours into the future
  return extendDataIntoFuture(lineData, 12)
}

/**
 * Aggregate strength data for each individual interval separately
 * Creates a LineData array for each interval, averaging across all tickers
 * Uses forward-fill interpolation to handle missing values
 *
 * @param allRawData - Raw data from all tickers
 * @param selectedIntervals - Array of selected intervals to process
 * @param allMarketData - Optional: all market data for consistent timestamps
 * @returns Object mapping interval -> LineData[] for each interval
 */
export const aggregateStrengthByInterval = (
  allRawData: (StrengthRowGet[] | null)[],
  selectedIntervals: string[],
  allMarketData?: (StrengthRowGet[] | null)[]
): StrengthIntervalsData => {
  // Extract all unique timestamps from ALL market data to ensure consistency
  const dataForTimestamps = allMarketData || allRawData
  const sortedTimestamps = extractGlobalTimestamps(dataForTimestamps)

  if (sortedTimestamps.length === 0) {
    return {}
  }

  const result: StrengthIntervalsData = {}

  // Process each interval that's selected
  for (const interval of STRENGTH_INTERVALS) {
    // Only process intervals that are selected
    if (!selectedIntervals.includes(interval)) {
      continue
    }

    // Helper function to extract strength value for a single interval
    const getIntervalValue = (item: StrengthRowGet): number | null => {
      const value = item[interval as keyof StrengthRowGet]

      if (value !== null && value !== undefined) {
        const numericValue =
          typeof value === 'string' ? parseFloat(value) : Number(value)

        if (Number.isFinite(numericValue)) {
          return numericValue
        }
      }

      return null
    }

    // Use the interpolation utility for this single interval
    const intervalData = aggregateStrengthDataWithInterpolation(
      allRawData,
      sortedTimestamps,
      (item: StrengthRowGet, _intervals: string[]) => getIntervalValue(item),
      [interval] // Pass single interval for the check in aggregation
    )

    // Convert to LineData format
    const lineData = intervalData.map((point) => ({
      time: point.time as Time,
      value: point.value,
    }))

    // Only add if we have data (extend into future)
    if (lineData.length > 0) {
      result[interval] = extendDataIntoFuture(lineData, 12)
    }
  }

  return result
}
