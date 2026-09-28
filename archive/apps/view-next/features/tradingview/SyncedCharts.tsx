'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useStrengthData } from './lib/data/useStrengthData'
import { calculateTimeRange } from './lib/chartUtils'
import { Chart, ChartRef } from './components/Chart'
import { LoadingState, ErrorState } from './components/ChartStates'
import { UpdatedTime } from './components/UpdatedTime'
import { useChartControlsStore } from './state/useChartControlsStore'
import { COLORS, FETCH_DATA_HOURS_BACK, LAZY_LOAD_FETCH_HOURS, INITIAL_VISIBLE_HOURS } from './constants'
import {
  useAggregationWorker,
  AggregationResult,
} from './lib/workers/useAggregationWorker'
import { LineData, Time } from 'lightweight-charts'
import { SCROLL_PAUSE_RESUME_MS } from './constants'
import { computeStrengthIndicator } from './lib/computeStrengthIndicator'
import { computePriceIndicator } from './lib/computePriceIndicator'

export interface SyncedChartsProps {
  availableHeight: number
  availableHeightCrop: number
}

/**
 * Generate a hash to detect meaningful changes that require re-aggregation
 * Includes: rawData (timestamps + values) AND selected intervals
 * This ensures re-aggregation when either data OR intervals change
 */
function getAggregationHash(rawData: unknown[], intervals: string[]): string {
  if (!rawData || rawData.length === 0) return 'empty'

  // Include intervals in hash so aggregation runs when intervals change
  let hash = `intervals:${[...intervals].sort().join(',')}|len:${
    rawData.length
  }`

  for (const tickerData of rawData) {
    if (!tickerData || !Array.isArray(tickerData)) {
      hash += '|null'
      continue
    }
    const arr = tickerData as { timenow: Date; price?: number }[]
    const len = arr.length
    const first = arr[0]?.timenow?.getTime() || 0
    const last = arr[len - 1]?.timenow?.getTime() || 0

    // Also include the price of the last few rows to detect value changes
    // (not just timestamp changes)
    let recentPriceHash = ''
    for (let i = Math.max(0, len - 5); i < len; i++) {
      const price = arr[i]?.price || 0
      recentPriceHash += `:${price.toFixed(2)}`
    }

    hash += `|${len}:${first}:${last}${recentPriceHash}`
  }
  return hash
}

/**
 * Generate a cache key for aggregated results
 * Based on tickers and intervals (not data content)
 * IMPORTANT: Use spread operator to avoid mutating the original arrays!
 */
function getAggregationCacheKey(
  tickers: string[],
  intervals: string[]
): string {
  return `${[...tickers].sort().join(',')}|${[...intervals].sort().join(',')}`
}

// Cache for aggregated results - survives ticker switches
// Keyed by ticker+interval combination
type AggregationCache = Map<
  string,
  {
    strengthAverage: LineData<Time>[] | null
    priceAverage: LineData<Time>[] | null
    strengthIntervals: Record<string, LineData<Time>[]>
    priceTickers: Record<string, LineData<Time>[]>
    strengthIndicator: LineData<Time>[] | null
    priceIndicator: LineData<Time>[] | null
    timestamp: number // When this was cached
  }
>

// Module-level cache (persists across component re-renders)
const aggregationCache: AggregationCache = new Map()
const CACHE_MAX_AGE_MS = 5 * 60 * 1000 // 5 minutes cache validity

/**
 * SyncedCharts - Main chart component with controlled data flow
 *
 * Data Flow:
 * 1. User selects tickers → dataState = 'loading', dataVersion++
 * 2. Historical data fetched → send to worker with dataVersion
 * 3. Worker returns aggregated data → validate dataVersion → render chart
 * 4. Real-time updates poll every 10s → debounced worker updates
 *
 * Performance Optimizations:
 * - Uses refs for processing state to avoid effect re-triggers
 * - Debounces rapid data changes (500ms minimum between aggregations)
 * - Skips aggregation if rawData hash hasn't changed
 *
 * Race Condition Prevention:
 * - dataVersion is tied to the data source (tickers)
 * - Worker results include dataVersion
 * - Results with stale dataVersion are ignored
 */
export function SyncedCharts({ availableHeight }: SyncedChartsProps) {
  const chartRef = useRef<ChartRef | null>(null)

  // Polling pause state - paused when user is scrolling/panning the chart
  const [pollingPaused, setPollingPaused] = useState(false)
  const scrollResumeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Track if initial time range has been set - prevents resetting zoom on real-time updates
  const initialTimeRangeSetRef = useRef(false)

  // Zustand store
  const {
    interval,
    chartTickers,
    timeRange,
    setTimeRange,
    setStrengthAverage,
    setPriceAverage,
    setStrengthIntervals,
    setPriceTickers,
    setStrengthIndicator,
    setPriceIndicator,
  } = useChartControlsStore()

  // Local state for chart rendering control
  const [chartData, setChartData] = useState<{
    strengthAverage: LineData<Time>[] | null
    priceAverage: LineData<Time>[] | null
    strengthIntervals: Record<string, LineData<Time>[]>
    priceTickers: Record<string, LineData<Time>[]>
    strengthIndicator: LineData<Time>[] | null
    priceIndicator: LineData<Time>[] | null
  }>({
    strengthAverage: null,
    priceAverage: null,
    strengthIntervals: {},
    priceTickers: {},
    strengthIndicator: null,
    priceIndicator: null,
  })

  // Track which dataVersion the current chartData corresponds to
  const chartDataVersionRef = useRef<number>(-1)

  // Refs for aggregation control (using refs to avoid effect re-triggers)
  const isProcessingRef = useRef(false)
  const lastAggregationTimeRef = useRef(0)
  const lastRawDataHashRef = useRef('')
  const lastIntervalsRef = useRef<string[]>([])
  const pendingAggregationRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Controlled data fetching hook
   * Handles ticker changes, loading state, and real-time updates
   * Paused when user is scrolling/panning the chart (latest bar not visible)
   */
  const {
    rawData,
    dataState,
    error,
    lastUpdateTime,
    dataVersion,
    earliestDataTime,
    latestDataTime,
    fetchHistoricalDataBefore,
    isLoadingHistorical,
  } = useStrengthData({
    tickers: chartTickers,
    enabled: chartTickers.length > 0,
    maxDataHours: FETCH_DATA_HOURS_BACK,
    updateIntervalMs: 10000,
    paused: pollingPaused,
  })

  /**
   * Handle user scroll/pan on chart (legacy - kept for general scroll detection)
   * The smart pause/resume is now handled by onLatestBarVisibilityChange
   */
  const handleUserScroll = useCallback(() => {
    // Clear any existing resume timer
    if (scrollResumeTimerRef.current) {
      clearTimeout(scrollResumeTimerRef.current)
    }

    // Set a fallback timer to resume polling after long inactivity
    // This is a safety net in case onLatestBarVisibilityChange doesn't fire
    scrollResumeTimerRef.current = setTimeout(() => {
      setPollingPaused(false)
      scrollResumeTimerRef.current = null
    }, SCROLL_PAUSE_RESUME_MS)
  }, [])

  /**
   * Handle visibility change of the latest bar
   * When the latest bar is visible, we should poll for new data (auto-scroll behavior)
   * When the latest bar is NOT visible (user scrolled back), pause polling
   */
  const handleLatestBarVisibilityChange = useCallback((isVisible: boolean) => {
    // Clear any pending scroll resume timer
    if (scrollResumeTimerRef.current) {
      clearTimeout(scrollResumeTimerRef.current)
      scrollResumeTimerRef.current = null
    }

    if (isVisible) {
      // Latest bar is visible - resume real-time updates
      if (pollingPaused) {
        setPollingPaused(false)
      }
    } else {
      // Latest bar is NOT visible - pause real-time updates
      // This prevents the chart from jumping to the latest data while user explores history
      if (!pollingPaused) {
        setPollingPaused(true)
      }
    }
  }, [pollingPaused])

  /**
   * Handle request for more historical data (lazy loading)
   * Called when user scrolls near the beginning of the chart data
   */
  const handleNeedMoreHistory = useCallback(() => {
    if (!earliestDataTime || isLoadingHistorical) {
      return
    }

    const fetchMinutes = LAZY_LOAD_FETCH_HOURS * 60 // Convert hours to minutes

    // Fetch more historical data before the earliest data point
    fetchHistoricalDataBefore(earliestDataTime, fetchMinutes)
  }, [earliestDataTime, isLoadingHistorical, fetchHistoricalDataBefore])

  // Cleanup scroll timer on unmount
  useEffect(() => {
    return () => {
      if (scrollResumeTimerRef.current) {
        clearTimeout(scrollResumeTimerRef.current)
      }
    }
  }, [])

  /**
   * Handle aggregation results from the Web Worker
   * Only accepts results where dataVersion matches current
   * Caches results for instant ticker switching
   */
  const handleAggregationResult = useCallback(
    (
      result: AggregationResult,
      _processingTimeMs: number,
      resultDataVersion: number
    ) => {
      // Mark processing as complete (use ref to avoid re-triggering effects)
      isProcessingRef.current = false
      lastAggregationTimeRef.current = Date.now()

      // Double-check: only update if this is for the current data version
      // (The worker hook already filters, but this is an extra safety check)
      if (resultDataVersion < chartDataVersionRef.current) {
        return
      }

      // Update the version this chart data corresponds to
      chartDataVersionRef.current = resultDataVersion

      // Compute indicators incrementally (pass previous values for efficiency)
      // Only new data points will be calculated, reusing previous EMA values
      const strengthIndicator = computeStrengthIndicator(
        result.strengthAverage,
        chartData.strengthIndicator
      )

      const priceIndicator = computePriceIndicator(
        result.priceAverage,
        chartData.priceIndicator
      )

      // Update local chart data
      const newChartData = {
        strengthAverage: result.strengthAverage,
        priceAverage: result.priceAverage,
        strengthIntervals: result.strengthIntervals,
        priceTickers: result.priceTickers,
        strengthIndicator,
        priceIndicator,
      }

      setChartData(newChartData)

      // Cache the results for instant ticker switching
      const cacheKey = getAggregationCacheKey(chartTickers, interval)
      aggregationCache.set(cacheKey, {
        strengthAverage: newChartData.strengthAverage,
        priceAverage: newChartData.priceAverage,
        strengthIntervals: newChartData.strengthIntervals,
        priceTickers: newChartData.priceTickers,
        strengthIndicator: newChartData.strengthIndicator,
        priceIndicator: newChartData.priceIndicator,
        timestamp: Date.now(),
      })

      // Limit cache size to prevent memory leaks (keep last 10 combinations)
      if (aggregationCache.size > 10) {
        const oldestKey = aggregationCache.keys().next().value
        if (oldestKey) aggregationCache.delete(oldestKey)
      }

      // Also update store for any external consumers
      setStrengthAverage(result.strengthAverage)
      setPriceAverage(result.priceAverage)
      setStrengthIntervals(result.strengthIntervals)
      setPriceTickers(result.priceTickers)
      setStrengthIndicator(strengthIndicator)
      setPriceIndicator(priceIndicator)
    },
    [
      chartTickers,
      interval,
      setStrengthAverage,
      setPriceAverage,
      setStrengthIntervals,
      setPriceTickers,
      setStrengthIndicator,
      setPriceIndicator,
    ]
  )

  const handleAggregationError = useCallback((errorMsg: string) => {
    console.error('[Worker] Aggregation error:', errorMsg)
    isProcessingRef.current = false
  }, [])

  /**
   * Web Worker for aggregation
   * Note: We don't use isProcessing from the hook - we use our own ref
   * to avoid re-triggering effects when processing state changes
   */
  const { aggregate, isReady, setValidDataVersion } = useAggregationWorker({
    enabled: true,
    onResult: handleAggregationResult,
    onError: handleAggregationError,
  })

  /**
   * Effect: When dataVersion changes (ticker switch), immediately clear chart
   * and update the valid version so old worker results are ignored.
   */
  useEffect(() => {
    // Set the valid version - any results with older version will be ignored
    setValidDataVersion(dataVersion)

    // Cancel any pending aggregation timeouts
    if (pendingAggregationRef.current) {
      clearTimeout(pendingAggregationRef.current)
      pendingAggregationRef.current = null
    }

    // Reset processing state - the old aggregation's result will be ignored
    // so we need to allow new aggregations to start
    isProcessingRef.current = false

    // Reset the raw data hash so new data will trigger aggregation
    lastRawDataHashRef.current = ''

    // Reset debounce timer so initial load is fast
    lastAggregationTimeRef.current = 0

    // Reset time range initialization flag so new ticker gets proper initial time range
    initialTimeRangeSetRef.current = false

    // Clear chart data immediately when version changes
    // This prevents showing old data while new data loads
    if (chartDataVersionRef.current !== dataVersion) {
      setChartData({
        strengthAverage: null,
        priceAverage: null,
        strengthIntervals: {},
        priceTickers: {},
        strengthIndicator: null,
        priceIndicator: null,
      })

      // Clear store data too
      setStrengthAverage(null)
      setPriceAverage(null)
      setStrengthIntervals({})
      setPriceTickers({})
      setStrengthIndicator(null)
      setPriceIndicator(null)
    }
  }, [
    dataVersion,
    setValidDataVersion,
    setStrengthAverage,
    setPriceAverage,
    setStrengthIntervals,
    setPriceTickers,
    setStrengthIndicator,
    setPriceIndicator,
  ])

  /**
   * Effect: Load from cache when ticker/interval changes
   * Provides instant display while fresh data is being fetched
   */
  useEffect(() => {
    if (dataState !== 'ready') return

    const cacheKey = getAggregationCacheKey(chartTickers, interval)
    const cached = aggregationCache.get(cacheKey)

    if (cached) {
      const age = Date.now() - cached.timestamp
      if (age < CACHE_MAX_AGE_MS) {
        // Use cached data immediately for instant display
        // Fresh aggregation will update this shortly
        if (chartData.strengthAverage === null) {
          setChartData({
            strengthAverage: cached.strengthAverage,
            priceAverage: cached.priceAverage,
            strengthIntervals: cached.strengthIntervals,
            priceTickers: cached.priceTickers,
            strengthIndicator: cached.strengthIndicator,
            priceIndicator: cached.priceIndicator,
          })
        }
      } else {
        // Cache expired, remove it
        aggregationCache.delete(cacheKey)
      }
    }
  }, [chartTickers, interval, dataState]) // Only when tickers/intervals change

  /**
   * Effect: Process data through worker when rawData changes
   *
   * Performance optimizations:
   * - Uses refs for processing state (not in dependency array)
   * - Debounces rapid changes with 2000ms minimum interval (real-time data is 10s)
   * - Skips if rawData hash hasn't changed (includes value comparison)
   * - Caches results for instant ticker switching
   */
  useEffect(() => {
    // Don't process if still loading or no data
    if (dataState !== 'ready') return
    if (rawData.length === 0 || !rawData.some((data) => data !== null)) return
    if (!isReady) return

    // Check if rawData OR intervals changed (both require re-aggregation)
    const currentHash = getAggregationHash(rawData, interval)
    if (currentHash === lastRawDataHashRef.current) {
      return
    }

    // Clear any pending aggregation
    if (pendingAggregationRef.current) {
      clearTimeout(pendingAggregationRef.current)
      pendingAggregationRef.current = null
    }

    // Function to actually trigger aggregation
    const triggerAggregation = () => {
      // Don't queue up requests if already processing
      if (isProcessingRef.current) {
        // Schedule retry after a short delay
        pendingAggregationRef.current = setTimeout(triggerAggregation, 500)
        return
      }

      // Update hash and mark as processing
      lastRawDataHashRef.current = currentHash
      isProcessingRef.current = true

      // Send to worker for aggregation with the current dataVersion
      aggregate(rawData, interval, chartTickers, dataVersion)
    }

    // Debounce timing:
    // - 100ms for initial load (fast first render)
    // - 100ms for interval changes (user expects immediate feedback)
    // - 2000ms for real-time data updates (data comes every 10s anyway)
    const timeSinceLastAggregation = Date.now() - lastAggregationTimeRef.current
    const isInitialLoad = lastAggregationTimeRef.current === 0

    // Check if intervals changed (user interaction - should be fast)
    const intervalsChanged =
      interval.length !== lastIntervalsRef.current.length ||
      interval.some((i) => !lastIntervalsRef.current.includes(i))
    lastIntervalsRef.current = [...interval]

    const DEBOUNCE_MS = isInitialLoad || intervalsChanged ? 100 : 2000

    if (timeSinceLastAggregation < DEBOUNCE_MS) {
      // Schedule aggregation after debounce period
      const delay = DEBOUNCE_MS - timeSinceLastAggregation
      pendingAggregationRef.current = setTimeout(triggerAggregation, delay)
    } else {
      // Execute immediately
      triggerAggregation()
    }

    // Cleanup pending timeout on unmount or dependency change
    return () => {
      if (pendingAggregationRef.current) {
        clearTimeout(pendingAggregationRef.current)
        pendingAggregationRef.current = null
      }
    }
  }, [
    rawData,
    dataState,
    interval,
    chartTickers,
    dataVersion,
    isReady,
    aggregate,
    // Note: isProcessing is NOT in dependencies - we use isProcessingRef instead
  ])

  /**
   * Effect: Calculate initial time range when data is ready
   *
   * Only sets the time range on initial data load.
   * After that, users can zoom in/out freely and the range is preserved.
   * Real-time data updates do NOT reset time range.
   */
  useEffect(() => {
    if (!chartData.strengthAverage || chartData.strengthAverage.length === 0)
      return

    // Don't recalculate time range when polling is paused
    // This prevents the chart from jumping when historical data is loaded
    if (pollingPaused) {
      return
    }

    // Only set time range on initial load
    if (!initialTimeRangeSetRef.current) {
      const newRange = calculateTimeRange(rawData, INITIAL_VISIBLE_HOURS)
      if (newRange && newRange.from < newRange.to) {
        setTimeRange(newRange)
        initialTimeRangeSetRef.current = true
      }
    }
    // Real-time data updates (rawData changes) do NOT reset time range
    // This preserves user's zoom level
  }, [rawData, chartData.strengthAverage, setTimeRange, pollingPaused])

  /**
   * Determine what to render based on state
   */
  const showLoading = dataState === 'loading'
  const showError = error && dataState !== 'loading'
  const showChart = chartData.strengthAverage !== null

  // Only pass timeRange to chart when we have valid data
  const chartTimeRange = showChart ? timeRange : undefined

  return (
    <div className="relative w-full">
      {/* Loading state - shown while fetching historical data */}
      {showLoading && <LoadingState />}

      {/* Error state */}
      {showError && <ErrorState error={error} />}

      {/* Chart - only rendered when data is ready */}
      {showChart && (
        <Chart
          key={`chart-${dataVersion}`}
          ref={(el) => {
            chartRef.current = el
          }}
          name="Strength & Price"
          heading={
            <span
              className="flex flex-row pl-[5px] scale2x"
              style={{ transformOrigin: 'left bottom' }}
            >
              <span className="pt-1 pr-1 pl-1 opacity-90 text-sm">
                <span
                  style={{
                    color: COLORS.price,
                    textShadow: '1px 1px 1px rgba(255, 255, 255, 1)',
                  }}
                >
                  Price
                </span>
                <span style={{ color: COLORS.light }}> / </span>
                <span
                  style={{
                    color: COLORS.strength,
                    textShadow: '1px 1px 1px rgba(255, 255, 255, 1)',
                  }}
                >
                  Strength
                </span>
              </span>
            </span>
          }
          strengthAverageData={chartData.strengthAverage}
          priceAverageData={chartData.priceAverage}
          strengthIntervalsData={chartData.strengthIntervals}
          priceTickersData={chartData.priceTickers}
          strengthIndicatorData={chartData.strengthIndicator}
          priceIndicatorData={chartData.priceIndicator}
          tickers={chartTickers}
          width={
            typeof window !== 'undefined'
              ? window.innerWidth * (window.scaleFactor || 1)
              : 1200
          }
          height={availableHeight}
          timeRange={chartTimeRange}
          onUserScroll={handleUserScroll}
          onNeedMoreHistory={handleNeedMoreHistory}
          onLatestBarVisibilityChange={handleLatestBarVisibilityChange}
          isLoadingHistorical={isLoadingHistorical}
        />
      )}

      {/* Loading overlay - shown while fetching additional historical data */}
      {isLoadingHistorical && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
          style={{ cursor: 'wait' }}
        >
          <div className="flex flex-col items-center gap-3">
            {/* Spinner */}
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm text-gray-300 bg-black/50 px-3 py-1 rounded">
              Loading history...
            </span>
          </div>
        </div>
      )}

      {/* Last updated time (shows paused indicator when user is scrolling) */}
      <UpdatedTime
        isRealtime={dataState === 'ready'}
        lastUpdateTime={lastUpdateTime}
        paused={pollingPaused}
      />

      {/* Target box for screen capture */}
      <div
        id="screenshot-target"
        className="absolute top-[34px] left-0 right-[8px] bottom-[34px] pointer-events-none"
      />
    </div>
  )
}
