import { useEffect, useRef, useState, useCallback } from 'react'
import { StrengthRowGet } from '@lib/db-trading/sql/strength'
import { FetchStrengthData } from './FetchStrengthData'
import { FETCH_DATA_HOURS_BACK } from '../../constants'
import { strengthIntervalsAll } from '../../state/useChartControlsStore'

export interface UseRealtimeStrengthDataOptions {
  tickers: string[]
  enabled?: boolean
  maxDataHours?: number
  updateIntervalMs?: number
}

export interface UseRealtimeStrengthDataResult {
  rawData: (StrengthRowGet[] | null)[]
  isLoading: boolean
  error: string | null
  lastUpdateTime: Date | null
  isRealtime: boolean
  /** True only on initial load, false for incremental updates */
  isInitialLoad: boolean
  /** Timestamps that were updated in the last fetch (for incremental updates) */
  updatedTimestamps: number[]
}

/**
 * Custom hook for managing real-time strength data updates
 * Fetches initial historical data and then polls for new data every 10 seconds.
 *
 * NOTE: Database rows are at 1-minute intervals, but each row is UPDATED every
 * few seconds with new interval values. We fetch every 10 seconds to get the
 * latest interval data as it becomes available, then update existing chart
 * points with new values.
 */
export function useRealtimeStrengthData({
  tickers,
  enabled = true,
  maxDataHours = FETCH_DATA_HOURS_BACK,
  updateIntervalMs = 10000, // 10 seconds default for real-time interval updates
}: UseRealtimeStrengthDataOptions): UseRealtimeStrengthDataResult {
  const [rawData, setRawData] = useState<(StrengthRowGet[] | null)[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [isRealtime, setIsRealtime] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [updatedTimestamps, setUpdatedTimestamps] = useState<number[]>([])

  // Track the last data timestamp we've received
  const lastDataTimestampRef = useRef<Date | null>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  /**
   * Load initial historical data
   */
  const loadInitialData = useCallback(async () => {
    if (!enabled || tickers.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const initialDate = FetchStrengthData.getInitialDataDate(maxDataHours)
      const allTickerData = await FetchStrengthData.fetchMultipleTickersData(
        tickers,
        initialDate
      )

      if (isMountedRef.current) {
        // Find the latest timestamp across all data
        let latestTimestamp: Date | null = null
        allTickerData.forEach((tickerData) => {
          if (tickerData && tickerData.length > 0) {
            const lastItem = tickerData[tickerData.length - 1]
            if (
              lastItem &&
              (!latestTimestamp || lastItem.timenow > latestTimestamp)
            ) {
              latestTimestamp = lastItem.timenow
            }
          }
        })

        const logData = {
          tickers,
          dataLengths: allTickerData.map((d) => d?.length || 0),
          tickerDataMapping: tickers.map((ticker, idx) => ({
            ticker,
            hasData:
              allTickerData[idx] !== null && allTickerData[idx]!.length > 0,
            dataPoints: allTickerData[idx]?.length || 0,
          })),
          latestDataTime: null as string | null,
        }

        if (latestTimestamp) {
          logData.latestDataTime = (latestTimestamp as Date).toISOString()
        }

        setRawData(allTickerData)
        lastDataTimestampRef.current = latestTimestamp
        setLastUpdateTime(new Date())
        setIsLoading(false)
        setIsRealtime(true) // Enable realtime after initial load
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Error loading initial data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
        setIsLoading(false)
      }
    }
  }, [tickers, enabled, maxDataHours])

  /**
   * Forward-fill missing strength values from historical data
   *
   * When fetching every 10 seconds, some intervals in the current row may still
   * be null (not yet calculated by the server). We fill these from the previous
   * row's values to ensure chart continuity.
   *
   * @param currentRow The row to forward-fill (may have null interval values)
   * @param historicalRow The row to use for filling (previous minute's data)
   * @returns The forward-filled row with null values replaced
   */
  const forwardFillStrengthData = (
    currentRow: StrengthRowGet,
    historicalRow: StrengthRowGet
  ): StrengthRowGet => {
    const filled = { ...currentRow }

    // Forward-fill each strength interval if null
    strengthIntervalsAll.forEach((interval) => {
      if (filled[interval] === null && historicalRow[interval] !== null) {
        filled[interval] = historicalRow[interval]
      }
    })

    // Forward-fill price if needed (though it usually has its own algorithm)
    if (filled.price === 0 || filled.price === null) {
      filled.price = historicalRow.price || 0
    }

    return filled
  }

  /**
   * Fetch incremental updates for real-time data
   *
   * With 10-second polling:
   * - Database rows exist at 1-minute intervals (e.g., 10:01:00, 10:02:00)
   * - Each row is UPDATED every few seconds with new interval values
   * - We fetch the last 2-3 minutes to get current + previous intervals
   * - Current interval: Forward-fill any missing values from previous
   * - Both intervals are returned to update existing chart data
   */
  const fetchRealtimeUpdate = useCallback(async () => {
    if (!enabled || tickers.length === 0 || !lastDataTimestampRef.current)
      return

    try {
      // Fetch the last 4 minutes of data to ensure we get:
      // - Current minute (actively being updated with new intervals)
      // - Previous minute (for forward-fill reference)
      // - One more for safety buffer
      const now = new Date()
      const fromDate = new Date(now.getTime() - 4 * 60 * 1000) // 4 minutes back
      const toDate = new Date() // Current time

      const newTickerData = await FetchStrengthData.fetchMultipleTickersData(
        tickers,
        fromDate,
        toDate
      )

      // Process each ticker's data to forward-fill missing values
      const processedTickerData = newTickerData.map((tickerData) => {
        if (!tickerData || tickerData.length === 0) {
          return tickerData
        }

        // Sort by timenow ascending (oldest first) for processing
        const sortedData = [...tickerData].sort(
          (a, b) => a.timenow.getTime() - b.timenow.getTime()
        )

        // Forward-fill each row from its predecessor
        // This ensures any missing interval values are filled from historical data
        const filledRows: StrengthRowGet[] = []

        for (let i = 0; i < sortedData.length; i++) {
          const currentRow = sortedData[i]!

          if (i === 0) {
            // First row has nothing to forward-fill from (in this batch)
            // It will merge with existing data which has historical context
            filledRows.push(currentRow)
          } else {
            // Forward-fill from previous row
            const previousRow = sortedData[i - 1]!
            const filledRow = forwardFillStrengthData(currentRow, previousRow)
            filledRows.push(filledRow)
          }
        }

        return filledRows
      })

      if (isMountedRef.current) {
        // Collect timestamps from new data for incremental updates
        const newTimestamps = new Set<number>()
        processedTickerData.forEach((tickerData) => {
          tickerData?.forEach((row) => {
            newTimestamps.add(row.timenow.getTime() / 1000)
          })
        })

        setRawData((prevData) => {
          // Track the latest timestamp after merge
          let newLatestTimestamp = lastDataTimestampRef.current

          // Merge new data with existing data for each ticker
          const mergedData = prevData.map((existingData, index) => {
            const newData = processedTickerData[index]
            if (!newData || newData.length === 0) return existingData
            if (!existingData) return newData

            // Merge and deduplicate data
            const merged = FetchStrengthData.mergeData(existingData, newData)

            // Update latest timestamp
            if (merged.length > 0) {
              const lastItem = merged[merged.length - 1]
              if (
                lastItem &&
                (!newLatestTimestamp || lastItem.timenow > newLatestTimestamp)
              ) {
                newLatestTimestamp = lastItem.timenow
              }
            }

            return merged
          })

          // Update the last data timestamp for next fetch
          lastDataTimestampRef.current = newLatestTimestamp

          return mergedData
        })

        // Mark as incremental update (not initial load)
        setIsInitialLoad(false)
        setUpdatedTimestamps(Array.from(newTimestamps))
        setLastUpdateTime(new Date())
      }
    } catch (err) {
      console.error('Error fetching realtime update:', err)
      // Don't set error state for realtime updates to avoid disrupting the UI
    }
  }, [tickers, enabled])

  /**
   * Setup real-time updates
   */
  const setupRealtimeUpdates = useCallback(() => {
    // Clear any existing interval
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }

    // Only setup if realtime is enabled and we have initial data
    if (isRealtime && rawData.length > 0) {
      // Start periodic updates
      updateIntervalRef.current = setInterval(() => {
        fetchRealtimeUpdate()
      }, updateIntervalMs)

      // Also fetch immediately to catch up if needed
      fetchRealtimeUpdate()
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
    }
  }, [isRealtime, rawData.length, fetchRealtimeUpdate, updateIntervalMs])

  // Effect for initial data load
  useEffect(() => {
    isMountedRef.current = true
    loadInitialData()

    return () => {
      isMountedRef.current = false
    }
  }, [loadInitialData])

  // Effect for real-time updates
  useEffect(() => {
    const cleanup = setupRealtimeUpdates()
    return cleanup
  }, [setupRealtimeUpdates])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
      isMountedRef.current = false
    }
  }, [])

  return {
    rawData,
    isLoading,
    error,
    lastUpdateTime,
    isRealtime,
    isInitialLoad,
    updatedTimestamps,
  }
}
