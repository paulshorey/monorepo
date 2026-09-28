/**
 * useStrengthData - Controlled data fetching hook with state machine
 *
 * Provides a clean, predictable flow for fetching and updating strength data:
 * 1. IDLE - No tickers selected
 * 2. LOADING - Fetching historical data (real-time paused)
 * 3. READY - Data ready, real-time updates active
 *
 * When tickers change:
 * - Pauses real-time updates
 * - Clears all data
 * - Fetches new historical data
 * - Resumes real-time updates
 *
 * Background Tab Handling:
 * - Tracks last successful fetch time
 * - When tab returns to foreground, fetches all missing data
 * - Uses visibility API to detect tab focus changes
 *
 * Forward-Fill Logic:
 * - New data is forward-filled from existing historical data
 * - Ensures continuity when intervals are null in recent rows
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { StrengthRowGet } from '@lib/db-trading/sql/strength'
import { FetchStrengthData } from './FetchStrengthData'
import { FETCH_DATA_HOURS_BACK } from '../../constants'
import { strengthIntervalsAll } from '../../state/useChartControlsStore'

export type DataState = 'idle' | 'loading' | 'ready'

export interface UseStrengthDataOptions {
  tickers: string[]
  enabled?: boolean
  maxDataHours?: number
  updateIntervalMs?: number
  /** Pause real-time polling (e.g., when user is scrolling the chart) */
  paused?: boolean
}

export interface UseStrengthDataResult {
  rawData: (StrengthRowGet[] | null)[]
  dataState: DataState
  error: string | null
  lastUpdateTime: Date | null
  /** Key that changes when tickers change - use for chart reset */
  dataVersion: number
  /** Timestamp of the earliest data point (for lazy loading detection) */
  earliestDataTime: Date | null
  /** Timestamp of the latest data point (for detecting if latest is visible) */
  latestDataTime: Date | null
  /** Fetch historical data going further back in time (for lazy loading) */
  fetchHistoricalDataBefore: (
    beforeDate: Date,
    minutes: number
  ) => Promise<void>
  /** Whether historical data is currently being loaded */
  isLoadingHistorical: boolean
}

/**
 * Forward-fill missing strength values from previous row
 * Fills null interval values and zero/null prices
 */
function forwardFillRow(
  currentRow: StrengthRowGet,
  previousRow: StrengthRowGet | null
): StrengthRowGet {
  if (!previousRow) return currentRow

  const filled = { ...currentRow }

  // Forward-fill each interval if null
  strengthIntervalsAll.forEach((interval) => {
    if (filled[interval] === null && previousRow[interval] !== null) {
      filled[interval] = previousRow[interval]
    }
  })

  // Forward-fill price if zero or null
  if (filled.price === 0 || filled.price === null) {
    filled.price = previousRow.price || 0
  }

  return filled
}

/**
 * Build a "composite" row with the last known value for each interval.
 * This searches backwards through the data to find the most recent non-null
 * value for EACH interval separately, rather than requiring a single row
 * where all intervals are complete.
 *
 * This handles the case where different intervals are calculated at different
 * times or have different lag in the database.
 */
function buildLastKnownValuesRow(
  data: StrengthRowGet[] | null
): StrengthRowGet | null {
  if (!data || data.length === 0) return null

  // Start with the last row as a base
  const lastRow = data[data.length - 1]
  if (!lastRow) return null

  // Create a composite row starting from the last row
  const compositeRow: StrengthRowGet = { ...lastRow }

  // For each interval, search backwards to find the last non-null value
  for (const interval of strengthIntervalsAll) {
    if (compositeRow[interval] !== null) continue // Already have a value

    // Search backwards for a non-null value for this specific interval
    for (let i = data.length - 2; i >= 0; i--) {
      const row = data[i]
      if (row && row[interval] !== null) {
        compositeRow[interval] = row[interval]
        break
      }
    }
  }

  // Also find the last non-null price
  if (compositeRow.price === null || compositeRow.price === 0) {
    for (let i = data.length - 2; i >= 0; i--) {
      const row = data[i]
      if (row && row.price !== null && row.price > 0) {
        compositeRow.price = row.price
        break
      }
    }
  }

  return compositeRow
}

/**
 * Minimum fetch window in minutes (always fetch at least this much)
 */
const MIN_FETCH_MINUTES = 4

/**
 * Maximum fetch window in minutes (cap to prevent huge fetches)
 */
const MAX_FETCH_MINUTES = 120 // 2 hours max

export function useStrengthData({
  tickers,
  enabled = true,
  maxDataHours = FETCH_DATA_HOURS_BACK,
  updateIntervalMs = 10000,
  paused = false,
}: UseStrengthDataOptions): UseStrengthDataResult {
  const [rawData, setRawData] = useState<(StrengthRowGet[] | null)[]>([])
  const [dataState, setDataState] = useState<DataState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [dataVersion, setDataVersion] = useState(0)
  const [earliestDataTime, setEarliestDataTime] = useState<Date | null>(null)
  const [latestDataTime, setLatestDataTime] = useState<Date | null>(null)
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false)

  // Refs for tracking state
  const isMountedRef = useRef(true)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentTickersRef = useRef<string[]>([])
  const lastDataTimestampRef = useRef<Date | null>(null)
  const earliestDataTimestampRef = useRef<Date | null>(null)

  // Track last successful fetch time for calculating dynamic window
  const lastSuccessfulFetchRef = useRef<Date | null>(null)

  // Track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false)
  const isFetchingHistoricalRef = useRef(false)

  /**
   * Stop real-time updates
   */
  const stopRealtimeUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }
  }, [])

  /**
   * Calculate how far back to fetch based on time since last successful fetch
   * Returns minutes to fetch back
   */
  const calculateFetchWindow = useCallback((): number => {
    if (!lastSuccessfulFetchRef.current) {
      // No previous fetch, use minimum
      return MIN_FETCH_MINUTES
    }

    const now = Date.now()
    const lastFetch = lastSuccessfulFetchRef.current.getTime()
    const minutesSinceLastFetch = Math.ceil((now - lastFetch) / (60 * 1000))

    // Add buffer for safety (fetch a few extra minutes)
    const fetchMinutes = Math.max(
      MIN_FETCH_MINUTES,
      minutesSinceLastFetch + 2 // +2 minute buffer
    )

    // Cap at maximum
    return Math.min(fetchMinutes, MAX_FETCH_MINUTES)
  }, [])

  /**
   * Fetch historical data going further back in time (for lazy loading)
   * This fetches data BEFORE the current earliest data point
   *
   * @param beforeDate - Fetch data before this date
   * @param minutes - Number of minutes of data to fetch
   */
  const fetchHistoricalDataBefore = useCallback(
    async (beforeDate: Date, minutes: number) => {
      if (!isMountedRef.current || currentTickersRef.current.length === 0) {
        return
      }

      // Prevent duplicate concurrent fetches
      if (isFetchingHistoricalRef.current) {
        return
      }

      isFetchingHistoricalRef.current = true
      setIsLoadingHistorical(true)

      try {
        // Calculate the time range to fetch
        const toDate = new Date(beforeDate.getTime())
        const fromDate = new Date(toDate.getTime() - minutes * 60 * 1000)

        const historicalTickerData =
          await FetchStrengthData.fetchMultipleTickersData(
            currentTickersRef.current,
            fromDate,
            toDate
          )

        if (!isMountedRef.current) {
          isFetchingHistoricalRef.current = false
          setIsLoadingHistorical(false)
          return
        }

        // Check if we actually got any data
        const totalRows = historicalTickerData.reduce(
          (sum, data) => sum + (data?.length || 0),
          0
        )
        if (totalRows === 0) {
          return
        }

        // Merge historical data with existing data (prepend to beginning)
        setRawData((prevData) => {
          let newEarliestTimestamp = earliestDataTimestampRef.current

          const mergedData = prevData.map((existingData, idx) => {
            const historicalData = historicalTickerData[idx]

            if (!historicalData || historicalData.length === 0) {
              return existingData
            }

            // Sort historical data
            const sortedHistorical = [...historicalData].sort(
              (a, b) => a.timenow.getTime() - b.timenow.getTime()
            )

            // Merge with existing data
            if (!existingData) {
              return sortedHistorical
            }

            const merged = FetchStrengthData.mergeData(
              sortedHistorical,
              existingData
            )

            // Track new earliest timestamp
            if (merged.length > 0) {
              const first = merged[0]
              if (
                first &&
                (!newEarliestTimestamp || first.timenow < newEarliestTimestamp)
              ) {
                newEarliestTimestamp = first.timenow
              }
            }

            return merged
          })

          // Update earliest timestamp
          earliestDataTimestampRef.current = newEarliestTimestamp
          if (newEarliestTimestamp) {
            setEarliestDataTime(newEarliestTimestamp)
          }

          return mergedData
        })
      } catch (err) {
        console.error('[useStrengthData] Error fetching historical data:', err)
        // Don't set error state - keep showing existing data
      } finally {
        isFetchingHistoricalRef.current = false
        setIsLoadingHistorical(false)
      }
    },
    []
  )

  /**
   * Fetch real-time update with dynamic window based on time since last fetch
   * Also handles forward-filling from existing historical data
   */
  const fetchRealtimeUpdate = useCallback(async () => {
    if (!isMountedRef.current || currentTickersRef.current.length === 0) return

    // Prevent duplicate concurrent fetches
    if (isFetchingRef.current) {
      return
    }
    isFetchingRef.current = true

    try {
      const now = new Date()
      const fetchMinutes = calculateFetchWindow()
      const fromDate = new Date(now.getTime() - fetchMinutes * 60 * 1000)
      const toDate = now

      const newTickerData = await FetchStrengthData.fetchMultipleTickersData(
        currentTickersRef.current,
        fromDate,
        toDate
      )

      if (!isMountedRef.current) {
        isFetchingRef.current = false
        return
      }

      // Mark fetch as successful
      lastSuccessfulFetchRef.current = now

      // Process and forward-fill, using existing data for context
      setRawData((prevData) => {
        let newLatestTimestamp = lastDataTimestampRef.current

        const mergedData = prevData.map((existingData, idx) => {
          const newData = newTickerData[idx]
          if (!newData || newData.length === 0) return existingData

          // Sort new data by time
          const sortedNewData = [...newData].sort(
            (a, b) => a.timenow.getTime() - b.timenow.getTime()
          )

          // Build composite row with last known values for each interval
          // This handles cases where different intervals have different lag
          const lastKnownValues = buildLastKnownValuesRow(existingData)

          // Forward-fill new data, using existing historical data for the first row
          const filledNewData: StrengthRowGet[] = []
          for (let i = 0; i < sortedNewData.length; i++) {
            const currentRow = sortedNewData[i]!

            if (i === 0) {
              // First row: forward-fill from existing historical data
              filledNewData.push(forwardFillRow(currentRow, lastKnownValues))
            } else {
              // Subsequent rows: forward-fill from previous new row
              filledNewData.push(
                forwardFillRow(currentRow, filledNewData[i - 1]!)
              )
            }
          }

          // Merge with existing data
          if (!existingData) {
            return filledNewData
          }

          const merged = FetchStrengthData.mergeData(
            existingData,
            filledNewData
          )

          // Track latest timestamp
          if (merged.length > 0) {
            const last = merged[merged.length - 1]
            if (
              last &&
              (!newLatestTimestamp || last.timenow > newLatestTimestamp)
            ) {
              newLatestTimestamp = last.timenow
            }
          }

          return merged
        })

        lastDataTimestampRef.current = newLatestTimestamp
        // Update the latest data time state for external consumers
        if (newLatestTimestamp) {
          setLatestDataTime(newLatestTimestamp)
        }
        return mergedData
      })

      setLastUpdateTime(now)
    } catch (err) {
      console.error('Real-time update error:', err)
      // Don't set error state - keep showing existing data
    } finally {
      isFetchingRef.current = false
    }
  }, [calculateFetchWindow])

  /**
   * Start real-time updates
   */
  const startRealtimeUpdates = useCallback(() => {
    stopRealtimeUpdates()

    // Set initial successful fetch time
    lastSuccessfulFetchRef.current = new Date()

    updateIntervalRef.current = setInterval(() => {
      fetchRealtimeUpdate()
    }, updateIntervalMs)
  }, [stopRealtimeUpdates, fetchRealtimeUpdate, updateIntervalMs])

  /**
   * Handle visibility change - fetch immediately when tab becomes visible
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        dataState === 'ready' &&
        currentTickersRef.current.length > 0 &&
        !paused
      ) {
        // Tab became visible - fetch immediately to fill any gaps
        fetchRealtimeUpdate()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [dataState, fetchRealtimeUpdate, paused])

  /**
   * Handle pause/resume of real-time polling
   * When paused: stop polling (user is scrolling/interacting with chart)
   * When resumed: fetch immediately to fill any gaps, then restart polling
   */
  useEffect(() => {
    if (dataState !== 'ready') return

    if (paused) {
      // Stop polling while paused
      stopRealtimeUpdates()
    } else {
      // Resume polling - fetch immediately to fill any gaps
      fetchRealtimeUpdate()
      startRealtimeUpdates()
    }
  }, [
    paused,
    dataState,
    stopRealtimeUpdates,
    startRealtimeUpdates,
    fetchRealtimeUpdate,
  ])

  /**
   * Load historical data for tickers
   */
  const loadHistoricalData = useCallback(
    async (tickersToLoad: string[]) => {
      if (tickersToLoad.length === 0) {
        setDataState('idle')
        setRawData([])
        return
      }

      // Stop any real-time updates
      stopRealtimeUpdates()

      // Clear existing data and set loading state
      setRawData([])
      setError(null)
      setDataState('loading')
      setDataVersion((v) => v + 1)
      lastDataTimestampRef.current = null
      lastSuccessfulFetchRef.current = null

      try {
        const initialDate = FetchStrengthData.getInitialDataDate(maxDataHours)
        const allTickerData = await FetchStrengthData.fetchMultipleTickersData(
          tickersToLoad,
          initialDate
        )

        if (!isMountedRef.current) return

        // Check if tickers changed while loading
        // Use Set comparison to handle order differences (arrays may be sorted elsewhere)
        const tickersToLoadSet = new Set(tickersToLoad)
        const currentTickersSet = new Set(currentTickersRef.current)
        const tickersMatch =
          tickersToLoadSet.size === currentTickersSet.size &&
          [...tickersToLoadSet].every((t) => currentTickersSet.has(t))

        if (!tickersMatch) {
          // Tickers changed during fetch - abort, new fetch will be triggered
          return
        }

        // Find earliest and latest timestamps
        let latestTimestamp: Date | null = null
        let earliestTimestamp: Date | null = null
        allTickerData.forEach((tickerData) => {
          if (tickerData && tickerData.length > 0) {
            const first = tickerData[0]
            const last = tickerData[tickerData.length - 1]
            if (
              first &&
              (!earliestTimestamp || first.timenow < earliestTimestamp)
            ) {
              earliestTimestamp = first.timenow
            }
            if (last && (!latestTimestamp || last.timenow > latestTimestamp)) {
              latestTimestamp = last.timenow
            }
          }
        })

        setRawData(allTickerData)
        lastDataTimestampRef.current = latestTimestamp
        earliestDataTimestampRef.current = earliestTimestamp
        lastSuccessfulFetchRef.current = new Date()
        setLastUpdateTime(new Date())
        setEarliestDataTime(earliestTimestamp)
        setLatestDataTime(latestTimestamp)
        setDataState('ready')

        // Start real-time updates
        startRealtimeUpdates()
      } catch (err) {
        if (isMountedRef.current) {
          console.error('Error loading historical data:', err)
          setError(err instanceof Error ? err.message : 'Failed to load data')
          setDataState('idle')
        }
      }
    },
    [maxDataHours, stopRealtimeUpdates, startRealtimeUpdates]
  )

  /**
   * Effect: Handle ticker changes
   * This is the main orchestrator - when tickers change, it kicks off the loading process
   */
  useEffect(() => {
    if (!enabled) {
      stopRealtimeUpdates()
      setDataState('idle')
      setRawData([])
      currentTickersRef.current = []
      return
    }

    // Check if tickers actually changed (use Set for order-independent comparison)
    const currentSet = new Set(currentTickersRef.current)
    const newSet = new Set(tickers)
    const tickersChanged =
      currentSet.size !== newSet.size ||
      ![...newSet].every((t) => currentSet.has(t))

    if (tickersChanged) {
      currentTickersRef.current = [...tickers]
      loadHistoricalData(tickers)
    }
  }, [tickers, enabled, loadHistoricalData, stopRealtimeUpdates])

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      stopRealtimeUpdates()
    }
  }, [stopRealtimeUpdates])

  return {
    rawData,
    dataState,
    error,
    lastUpdateTime,
    dataVersion,
    earliestDataTime,
    latestDataTime,
    fetchHistoricalDataBefore,
    isLoadingHistorical,
  }
}
