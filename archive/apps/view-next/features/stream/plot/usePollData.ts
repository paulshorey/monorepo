import {
  useCallback,
  useEffect,
  useRef,
  useState,
  MutableRefObject,
} from 'react'
import type { IChartApi, LogicalRange } from 'lightweight-charts'
import type { Candle } from '@/lib/market-data/candles'
import {
  POLL_INTERVAL_MS,
  RECENT_CANDLES,
  PRICE_SCALE_RIGHT_OFFSET,
  LAZY_LOAD_BARS_THRESHOLD,
  LAZY_LOAD_FETCH_HOURS,
  LAZY_LOAD_COOLDOWN_MS,
  buildCandlesUrl,
  buildCandlesUrlRange,
} from './constants'
import { usePlotData } from './usePlotData'
import type { SeriesRefs, AbsorptionRefs } from './useInitChart'

interface UsePollDataProps {
  chartRef: MutableRefObject<IChartApi | null>
  dataRef: MutableRefObject<Candle[]>
  seriesRefs: SeriesRefs
  absorptionRefs: AbsorptionRefs
  width: number
}

interface UsePollDataReturn {
  isLoading: boolean
  error: string | null
}

export function usePollData({
  chartRef,
  dataRef,
  seriesRefs,
  absorptionRefs,
  width,
}: UsePollDataProps): UsePollDataReturn {
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)
  const hasStartedPollingRef = useRef(false)

  // Lazy loading state
  const isLoadingHistoricalRef = useRef(false)
  const lastLazyLoadTimeRef = useRef(0)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { plotChartData } = usePlotData({ seriesRefs, absorptionRefs })

  const fetchCandles = useCallback(async (limit: number) => {
    const response = await fetch(buildCandlesUrl(limit))
    if (!response.ok) {
      throw new Error(`Failed to fetch candles: ${response.status}`)
    }
    return (await response.json()) as Candle[]
  }, [])

  const fetchCandlesRange = useCallback(
    async (startMs: number, endMs: number) => {
      const response = await fetch(buildCandlesUrlRange(startMs, endMs))
      if (!response.ok) {
        throw new Error(`Failed to fetch candles: ${response.status}`)
      }
      return (await response.json()) as Candle[]
    },
    []
  )

  const applyRecentCandles = useCallback(
    (recentCandles: Candle[]) => {
      const existing = dataRef.current
      if (existing.length === 0) {
        dataRef.current = recentCandles
        plotChartData(recentCandles)
        return
      }

      // Create index for fast lookup of existing candles by timestamp
      const startIndex = Math.max(0, existing.length - recentCandles.length - 2)
      const indexByTime = new Map<number, number>()
      for (let i = startIndex; i < existing.length; i += 1) {
        const candle = existing[i]
        if (!candle) continue
        indexByTime.set(candle.time, i)
      }

      let didUpdate = false

      for (const candle of recentCandles) {
        const existingIndex = indexByTime.get(candle.time)
        if (existingIndex !== undefined) {
          const existingCandle = existing[existingIndex]
          if (existingCandle && existingCandle.close !== candle.close) {
            existing[existingIndex] = candle
            didUpdate = true
          }
          continue
        }

        const lastExisting = existing[existing.length - 1]
        if (lastExisting && candle.time > lastExisting.time) {
          existing.push(candle)
          didUpdate = true
        }
      }

      if (didUpdate) {
        plotChartData(existing)
      }
    },
    [dataRef, plotChartData]
  )

  /**
   * Fetch historical candles before the earliest data point and prepend them.
   * Restores the user's scroll position after prepending so the view doesn't jump.
   */
  const fetchHistoricalBefore = useCallback(async () => {
    if (isLoadingHistoricalRef.current) return
    const data = dataRef.current
    if (data.length === 0) return

    const earliest = data[0]
    if (!earliest) return

    isLoadingHistoricalRef.current = true

    try {
      const endMs = earliest.time // exclusive: up to (but not including) current earliest
      const startMs = endMs - LAZY_LOAD_FETCH_HOURS * 60 * 60 * 1000

      const historicalCandles = await fetchCandlesRange(startMs, endMs)
      if (historicalCandles.length === 0) return

      // De-duplicate: only keep candles with timestamps before our earliest
      const earliestTime = earliest.time
      const newCandles = historicalCandles.filter(
        (c) => c.time < earliestTime
      )
      if (newCandles.length === 0) return

      // Save visible logical range before prepending
      const chart = chartRef.current
      let savedLogicalRange: LogicalRange | null = null
      if (chart) {
        savedLogicalRange = chart.timeScale().getVisibleLogicalRange()
      }

      const prependedCount = newCandles.length

      // Prepend historical data and re-plot everything
      dataRef.current = [...newCandles, ...data]
      plotChartData(dataRef.current)

      // Restore scroll position: offset visible range by number of prepended bars
      if (chart && savedLogicalRange && prependedCount > 0) {
        requestAnimationFrame(() => {
          if (!chart) return
          try {
            chart.timeScale().setVisibleLogicalRange({
              from: savedLogicalRange!.from + prependedCount,
              to: savedLogicalRange!.to + prependedCount,
            })
          } catch {
            // Scroll position restoration failed - not critical
          }
        })
      }
    } catch (err) {
      console.error('Error fetching historical candles:', err)
    } finally {
      isLoadingHistoricalRef.current = false
    }
  }, [chartRef, dataRef, fetchCandlesRange, plotChartData])

  /**
   * Subscribe to visible range changes to detect when user scrolls near
   * the beginning of available data, triggering lazy loading of more history.
   */
  useEffect(() => {
    const chart = chartRef.current
    const priceSeries = seriesRefs.price?.current
    if (!chart || !priceSeries) return

    const handleVisibleLogicalRangeChange = (
      logicalRange: LogicalRange | null
    ) => {
      if (!logicalRange) return
      if (dataRef.current.length === 0) return

      const barsInfo = priceSeries.barsInLogicalRange(logicalRange)
      if (!barsInfo) return

      const now = Date.now()
      const timeSinceLastLoad = now - lastLazyLoadTimeRef.current

      if (
        barsInfo.barsBefore !== null &&
        barsInfo.barsBefore < LAZY_LOAD_BARS_THRESHOLD &&
        !isLoadingHistoricalRef.current &&
        timeSinceLastLoad > LAZY_LOAD_COOLDOWN_MS
      ) {
        lastLazyLoadTimeRef.current = now
        void fetchHistoricalBefore()
      }
    }

    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)

    return () => {
      chart
        .timeScale()
        .unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)
    }
  }, [chartRef, seriesRefs.price, dataRef, fetchHistoricalBefore])

  const pollLatest = useCallback(async () => {
    if (isPollingRef.current) return
    isPollingRef.current = true
    try {
      const recentCandles = await fetchCandles(RECENT_CANDLES)
      if (recentCandles.length > 0) {
        applyRecentCandles(recentCandles)
      }
    } catch (err) {
      console.error('Error fetching recent candles:', err)
    } finally {
      isPollingRef.current = false
    }
  }, [applyRecentCandles, fetchCandles])

  const startPolling = useCallback(() => {
    if (hasStartedPollingRef.current) return
    hasStartedPollingRef.current = true

    if (pollRef.current) {
      clearInterval(pollRef.current)
    }
    pollRef.current = setInterval(() => {
      void pollLatest()
    }, POLL_INTERVAL_MS)
  }, [pollLatest])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    hasStartedPollingRef.current = false
  }, [])

  // Load initial data and start polling
  useEffect(() => {
    let isMounted = true
    const SCREEN_CANDLES = 2 * (width - PRICE_SCALE_RIGHT_OFFSET - 80)

    fetchCandles(SCREEN_CANDLES)
      .then((initialCandles) => {
        if (!isMounted) return
        if (initialCandles.length > 0) {
          dataRef.current = initialCandles
          plotChartData(initialCandles)

          // Show ~50% of the data, zoomed in with the latest candle visible
          if (chartRef.current) {
            const totalBars = initialCandles.length
            const barsToShow = Math.floor(totalBars * 0.5)
            const lastBarIndex = totalBars - 1
            const fromIndex = lastBarIndex - barsToShow

            chartRef.current.timeScale().setVisibleLogicalRange({
              from: fromIndex,
              to: lastBarIndex + 2,
            })
          }
        }
        setIsLoading(false)
        startPolling()
      })
      .catch((err) => {
        console.error('Error loading initial candles:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
      stopPolling()
    }
  }, [
    fetchCandles,
    plotChartData,
    startPolling,
    stopPolling,
    chartRef,
    dataRef,
    width,
  ])

  return {
    isLoading,
    error,
  }
}
