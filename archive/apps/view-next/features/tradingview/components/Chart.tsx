'use client'

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import {
  createChart,
  IChartApi,
  LineData,
  LineSeries,
  ISeriesApi,
  Time,
  LogicalRange,
} from 'lightweight-charts'
import { getChartConfig, getLineSeriesConfig } from '../lib/chartConfig'
import { updateSeriesEfficiently } from '../lib/chartUtils'
import { useChartEventPatcher } from '../lib/useChartEventPatcher'
import { useTimeMarkers } from '../lib/primitives/useTimeMarkers'
import ChartTitle from './ChartTitle'
import { NoDataState } from './ChartStates'
import classes from '../classes.module.scss'
import { prepareDataWithRequiredTimestamps } from '../lib/primitives/forwardFillData'
import {
  TIME_RANGE_HIGHLIGHTS,
  SHOW_0_LINE,
  SHOW_100_LINES,
  LAZY_LOAD_BARS_THRESHOLD,
  LAZY_LOAD_COOLDOWN_MS,
  FUTURE_PADDING_BARS,
} from '../constants'
import {
  strengthIntervalsAll as STRENGTH_INTERVALS,
  StrengthIntervalsData,
  PriceTickersData,
  useChartControlsStore,
} from '../state/useChartControlsStore'
import { COLORS } from '../constants'

interface ChartProps {
  heading: string | React.ReactNode
  name: string
  strengthAverageData: LineData[] | null
  priceAverageData?: LineData[] | null
  strengthIntervalsData?: StrengthIntervalsData
  priceTickersData?: PriceTickersData
  strengthIndicatorData?: LineData[] | null
  priceIndicatorData?: LineData[] | null
  tickers?: string[]
  width: number
  height: number
  timeRange?: { from: Time; to: Time } | null
  /** Called when user scrolls/pans the chart (visible time range changes) */
  onUserScroll?: () => void
  /** Called when user scrolls near the beginning of data and needs more historical data */
  onNeedMoreHistory?: () => void
  /** Called when the visibility of the latest bar changes (true = latest bar is visible, false = scrolled away) */
  onLatestBarVisibilityChange?: (isVisible: boolean) => void
  /** Whether historical data is currently being loaded (to prevent duplicate requests) */
  isLoadingHistorical?: boolean
}

export interface ChartRef {
  chart: IChartApi | null
  strengthAverageSeries: ISeriesApi<'Line'> | null
  priceAverageSeries?: ISeriesApi<'Line'> | null
  strengthIntervalSeries?: Record<string, ISeriesApi<'Line'>>
  priceTickerSeries?: Record<string, ISeriesApi<'Line'>>
  container: HTMLDivElement | null
}

export const Chart = forwardRef<ChartRef, ChartProps>(
  (
    {
      heading,
      name,
      strengthAverageData: strengthAverage,
      priceAverageData: priceAverage,
      strengthIntervalsData: strengthIntervals,
      priceTickersData: priceTickers,
      strengthIndicatorData: strengthIndicator,
      priceIndicatorData: priceIndicator,
      tickers = [],
      width,
      height,
      timeRange,
      onUserScroll,
      onNeedMoreHistory,
      onLatestBarVisibilityChange,
      isLoadingHistorical = false,
    },
    ref
  ) => {
    const {
      showStrengthLine,
      showStrengthIntervalLines,
      showPriceLine,
      showPriceTickerLines,
      showStrengthIndicatorLine,
      showPriceIndicatorLine,
      interval: selectedIntervals, // Which intervals are selected (for visibility)
    } = useChartControlsStore()

    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const strengthAverageSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const priceAverageSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const strengthIntervalSeriesRef = useRef<
      Record<string, ISeriesApi<'Line'>>
    >({})
    const priceTickerSeriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({})
    const strengthIndicatorSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const priceIndicatorSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const zeroLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const plus100LineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const minus100LineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const hasInitialized = useRef(false)
    const lastStrengthAverageRef = useRef<LineData[] | null>(null)
    const lastPriceAverageRef = useRef<LineData[] | null>(null)
    const lastStrengthIntervalsRef = useRef<StrengthIntervalsData>({})
    const lastPriceTickersRef = useRef<PriceTickersData>({})
    const lastStrengthIndicatorRef = useRef<LineData[] | null>(null)
    const lastPriceIndicatorRef = useRef<LineData[] | null>(null)

    // Refs for lazy loading and visibility tracking
    const lastLatestBarVisibleRef = useRef<boolean>(true)
    const isLoadingHistoricalRef = useRef<boolean>(false)
    const lastLazyLoadTimeRef = useRef<number>(0)
    // Flag to skip timeRange application after scroll position restoration
    const skipTimeRangeUpdateRef = useRef<boolean>(false)
    // Keep refs to callbacks to avoid stale closures
    const onNeedMoreHistoryRef = useRef(onNeedMoreHistory)
    const onLatestBarVisibilityChangeRef = useRef(onLatestBarVisibilityChange)

    // Update callback refs when they change
    useEffect(() => {
      onNeedMoreHistoryRef.current = onNeedMoreHistory
      onLatestBarVisibilityChangeRef.current = onLatestBarVisibilityChange
    }, [onNeedMoreHistory, onLatestBarVisibilityChange])

    // Update loading ref when prop changes
    useEffect(() => {
      isLoadingHistoricalRef.current = isLoadingHistorical
    }, [isLoadingHistorical])

    // Use extracted hooks
    const { createTimeMarkers, markersInitialized } = useTimeMarkers()
    useChartEventPatcher(containerRef, onUserScroll)

    useImperativeHandle(ref, () => ({
      chart: chartRef.current,
      strengthAverageSeries: strengthAverageSeriesRef.current,
      priceAverageSeries: priceAverageSeriesRef.current,
      strengthIntervalSeries: strengthIntervalSeriesRef.current,
      priceTickerSeries: priceTickerSeriesRef.current,
      container: containerRef.current,
    }))

    // Create chart only once on mount
    useEffect(() => {
      if (!containerRef.current || hasInitialized.current) return

      // Create chart
      const chart = createChart(containerRef.current, getChartConfig(height))
      chartRef.current = chart
      hasInitialized.current = true

      // Add dedicated horizontal line series (always visible, independent of other series)
      // These ensure the reference lines are always shown regardless of which strength lines are displayed
      // Zero line (y=0) - only if enabled
      if (SHOW_0_LINE) {
        const zeroLineSeries = chart.addSeries(LineSeries, {
          color: COLORS.green,
          lineWidth: 2,
          lineStyle: 1, // Solid: 0, Dotted: 1, Dashed: 2
          priceScaleId: 'left', // Same scale as strength series
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
        })
        zeroLineSeriesRef.current = zeroLineSeries
      }

      // +100 and -100 lines (upper/lower bounds) - only if enabled
      if (SHOW_100_LINES) {
        const plus100LineSeries = chart.addSeries(LineSeries, {
          color: COLORS.red,
          lineWidth: 1,
          lineStyle: 1,
          priceScaleId: 'left',
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
        })
        plus100LineSeriesRef.current = plus100LineSeries

        const minus100LineSeries = chart.addSeries(LineSeries, {
          color: COLORS.dark,
          lineWidth: 1,
          lineStyle: 1,
          priceScaleId: 'left',
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
        })
        minus100LineSeriesRef.current = minus100LineSeries
      }

      // Price average - uses 'right' scale (default)
      // Always create the series, even if data doesn't exist yet
      const priceAverageSeries = chart.addSeries(LineSeries, {
        ...getLineSeriesConfig(),
        lineWidth: showPriceTickerLines ? 2 : 1,
        color: COLORS.price,
        priceScaleId: 'right',
      })
      priceAverageSeriesRef.current = priceAverageSeries

      // Price indicator (moving average) - uses 'right' scale
      const priceIndicatorSeries = chart.addSeries(LineSeries, {
        ...getLineSeriesConfig(),
        lineWidth: 1,
        color: COLORS.indicator,
        priceScaleId: 'right',
      })
      priceIndicatorSeriesRef.current = priceIndicatorSeries

      // Strength average - uses 'left' scale
      const strengthAverageSeries = chart.addSeries(LineSeries, {
        ...getLineSeriesConfig(),
        lineWidth: showStrengthIntervalLines ? 2 : 1,
        color: COLORS.strength,
        priceScaleId: 'left',
      })
      strengthAverageSeriesRef.current = strengthAverageSeries

      // Strength indicator (moving average) - uses 'left' scale
      const strengthIndicatorSeries = chart.addSeries(LineSeries, {
        ...getLineSeriesConfig(),
        lineWidth: 1,
        color: COLORS.indicator,
        priceScaleId: 'left',
      })
      strengthIndicatorSeriesRef.current = strengthIndicatorSeries

      // Strength interval series - uses 'left' scale to compare with strength average
      // These are created once and data is set/updated later
      STRENGTH_INTERVALS.forEach((interval) => {
        const intervalSeries = chart.addSeries(LineSeries, {
          ...getLineSeriesConfig(),
          lineWidth: interval === '181' && !showStrengthLine ? 2 : 1,
          color: COLORS.strength_i,
          priceScaleId: 'left', // Use same scale as strength average
        })
        strengthIntervalSeriesRef.current[interval] = intervalSeries
      })

      // Set initial data if available
      if (strengthAverage) {
        strengthAverageSeries.setData(strengthAverage)
      }
      if (priceAverage && priceAverageSeriesRef.current) {
        priceAverageSeriesRef.current.setData(priceAverage)
      }
      if (strengthIndicator && strengthIndicatorSeriesRef.current) {
        strengthIndicatorSeriesRef.current.setData(strengthIndicator)
      }
      if (priceIndicator && priceIndicatorSeriesRef.current) {
        priceIndicatorSeriesRef.current.setData(priceIndicator)
      }

      // Set initial strength intervals data if available
      if (strengthIntervals) {
        Object.entries(strengthIntervals).forEach(([interval, data]) => {
          if (data && strengthIntervalSeriesRef.current[interval]) {
            strengthIntervalSeriesRef.current[interval].setData(data)
          }
        })
      }

      // NOTE: Don't set initial time range here - wait for data to be loaded
      // setVisibleRange fails if the series has no data
      // Time range is applied after data is set in the useEffect hooks below

      // Track mouse position for zoom anchor (wheel event clientX/Y is unreliable for trackpad pinch)
      let lastMouseX: number | null = null
      // Track when the last zoom gesture occurred, to suppress momentum scroll events
      // that follow a zoom gesture (macOS trackpad momentum events lose the modifier key)
      let lastZoomTime = 0
      const ZOOM_COOLDOWN_MS = 400

      const handleMouseMove = (e: MouseEvent) => {
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (containerRect) {
          lastMouseX = e.clientX - containerRect.left
        }
      }

      const handleMouseLeave = () => {
        lastMouseX = null
      }

      // Custom zoom handler with adaptive anchor point
      // - If latest data bar is visible (real-time mode): anchor at right edge of visible range
      // - If scrolled back (historical mode): anchor at cursor position
      // Requires cmd (Mac) or ctrl (Windows) + scroll to zoom
      const handleWheel = (e: WheelEvent) => {
        // Only handle zoom gestures: ctrl/cmd+wheel or trackpad pinch
        const isZoomGesture = e.ctrlKey || e.metaKey

        if (isZoomGesture) {
          lastZoomTime = Date.now()
        } else if (Date.now() - lastZoomTime < ZOOM_COOLDOWN_MS) {
          // Suppress momentum scroll events that follow a zoom gesture.
          // On macOS, trackpad momentum events may lose the modifier key,
          // which would cause lightweight-charts to interpret them as pan.
          e.preventDefault()
          e.stopPropagation()
          return
        } else {
          return // Regular scroll, let lightweight-charts handle scroll/pan
        }

        e.preventDefault()
        e.stopPropagation()

        const timeScale = chart.timeScale()
        const visibleRange = timeScale.getVisibleLogicalRange()
        if (!visibleRange) return

        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect) return

        // Current range
        const currentFrom = visibleRange.from
        const currentTo = visibleRange.to
        const currentWidth = currentTo - currentFrom

        // Determine anchor point based on whether latest bar is visible
        let anchorLogical: number
        const data = lastStrengthAverageRef.current

        if (lastLatestBarVisibleRef.current && data && data.length > 0) {
          // Real-time mode: anchor at the right edge of the visible range.
          // This prevents the chart from drifting into future empty space
          // during zoom-out. All expansion/contraction happens on the left
          // side (history), keeping the last candle approximately fixed.
          anchorLogical = currentTo
        } else {
          // Historical mode: anchor at cursor position
          const cursorX = lastMouseX ?? e.clientX - containerRect.left
          const cursorLogicalVal = timeScale.coordinateToLogical(cursorX)
          if (cursorLogicalVal === null) return
          anchorLogical = cursorLogicalVal
        }

        // Calculate anchor position as fraction of visible range (0 = left, 1 = right)
        const anchorFraction = (anchorLogical - currentFrom) / currentWidth

        // Calculate zoom factor based on wheel delta
        // Smaller factor for smoother zoom
        const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95 // zoom out : zoom in

        // New width after zoom
        const newWidth = currentWidth * zoomFactor

        // Minimum and maximum zoom limits
        const minBars = 10
        const maxBars = 50000
        if (newWidth < minBars || newWidth > maxBars) return

        // Anchor zoom: keep anchorLogical at the same screen position
        let newFrom = anchorLogical - anchorFraction * newWidth
        let newTo = newFrom + newWidth

        // In real-time mode, clamp the right edge to prevent extending
        // beyond the data range (including future padding)
        if (lastLatestBarVisibleRef.current && data && data.length > 0) {
          const maxTo = data.length - 1
          if (newTo > maxTo) {
            newTo = maxTo
            newFrom = newTo - newWidth
          }
        }

        // Apply the new range
        timeScale.setVisibleLogicalRange({
          from: newFrom,
          to: newTo,
        })
      }

      // Pinch-to-zoom for mobile devices
      let lastPinchDistance: number | null = null
      let lastPinchMidpointX: number | null = null

      const handleTouchStart = (e: TouchEvent) => {
        const touch0 = e.touches[0]
        const touch1 = e.touches[1]
        if (e.touches.length === 2 && touch0 && touch1) {
          // Calculate initial distance between two fingers
          const dx = touch1.clientX - touch0.clientX
          const dy = touch1.clientY - touch0.clientY
          lastPinchDistance = Math.sqrt(dx * dx + dy * dy)
          // Calculate midpoint X position
          lastPinchMidpointX = (touch0.clientX + touch1.clientX) / 2
        }
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (
          e.touches.length !== 2 ||
          lastPinchDistance === null ||
          lastPinchMidpointX === null
        )
          return

        const touch0 = e.touches[0]
        const touch1 = e.touches[1]
        if (!touch0 || !touch1) return

        e.preventDefault()

        // Calculate current distance between fingers
        const dx = touch1.clientX - touch0.clientX
        const dy = touch1.clientY - touch0.clientY
        const currentDistance = Math.sqrt(dx * dx + dy * dy)

        // Calculate current midpoint (in screen coordinates)
        const currentMidpointX = (touch0.clientX + touch1.clientX) / 2

        const timeScale = chart.timeScale()
        const visibleRange = timeScale.getVisibleLogicalRange()
        if (!visibleRange) return

        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect) return

        const currentFrom = visibleRange.from
        const currentTo = visibleRange.to
        const currentWidth = currentTo - currentFrom

        // Determine anchor point based on whether latest bar is visible
        let anchorLogical: number
        const data = lastStrengthAverageRef.current

        if (lastLatestBarVisibleRef.current && data && data.length > 0) {
          // Real-time mode: anchor at the right edge of the visible range.
          // This prevents the chart from drifting into future empty space
          // during zoom-out. All expansion/contraction happens on the left
          // side (history), keeping the last candle approximately fixed.
          anchorLogical = currentTo
        } else {
          // Historical mode: anchor at pinch midpoint
          const scale = window.scaleFactor || 1
          const relativeX = currentMidpointX - containerRect.left
          const anchorX = relativeX * scale // Scale the touch position for the 2x chart

          const anchorLogicalVal = timeScale.coordinateToLogical(anchorX)
          if (anchorLogicalVal === null) return
          anchorLogical = anchorLogicalVal
        }

        // Calculate anchor position as fraction of visible range
        const anchorFraction = (anchorLogical - currentFrom) / currentWidth

        // Calculate zoom factor from pinch distance change
        // Inverted: spreading fingers apart (larger distance) = zoom in (smaller factor)
        const zoomFactor = lastPinchDistance / currentDistance

        const newWidth = currentWidth * zoomFactor

        // Apply zoom limits
        const minBars = 10
        const maxBars = 50000
        if (newWidth < minBars || newWidth > maxBars) return

        // Anchor zoom: keep anchorLogical at the same screen position
        let newFrom = anchorLogical - anchorFraction * newWidth
        let newTo = newFrom + newWidth

        // In real-time mode, clamp the right edge to prevent extending
        // beyond the data range (including future padding)
        if (lastLatestBarVisibleRef.current && data && data.length > 0) {
          const maxTo = data.length - 1
          if (newTo > maxTo) {
            newTo = maxTo
            newFrom = newTo - newWidth
          }
        }

        timeScale.setVisibleLogicalRange({
          from: newFrom,
          to: newTo,
        })

        // Update last values for next move event
        lastPinchDistance = currentDistance
        lastPinchMidpointX = currentMidpointX
      }

      const handleTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
          lastPinchDistance = null
          lastPinchMidpointX = null
        }
      }

      // Use capture phase to intercept before lightweight-charts
      const container = containerRef.current
      container.addEventListener('mousemove', handleMouseMove, {
        passive: true,
      })
      container.addEventListener('mouseleave', handleMouseLeave, {
        passive: true,
      })
      container.addEventListener('wheel', handleWheel, {
        passive: false,
        capture: true,
      })
      container.addEventListener('touchstart', handleTouchStart, {
        passive: true,
        capture: true,
      })
      container.addEventListener('touchmove', handleTouchMove, {
        passive: false,
        capture: true,
      })
      container.addEventListener('touchend', handleTouchEnd, {
        passive: true,
        capture: true,
      })

      // Cleanup
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
        container.removeEventListener('wheel', handleWheel, { capture: true })
        container.removeEventListener('touchstart', handleTouchStart, {
          capture: true,
        })
        container.removeEventListener('touchmove', handleTouchMove, {
          capture: true,
        })
        container.removeEventListener('touchend', handleTouchEnd, {
          capture: true,
        })
        chart.remove()
        chartRef.current = null
        strengthAverageSeriesRef.current = null
        priceAverageSeriesRef.current = null
        strengthIndicatorSeriesRef.current = null
        priceIndicatorSeriesRef.current = null
        zeroLineSeriesRef.current = null
        plus100LineSeriesRef.current = null
        minus100LineSeriesRef.current = null
        strengthIntervalSeriesRef.current = {}
        priceTickerSeriesRef.current = {}
        hasInitialized.current = false
      }
    }, []) // Only run once on mount

    // Update strength average series data
    useEffect(() => {
      if (
        !strengthAverageSeriesRef.current ||
        !strengthAverage ||
        !hasInitialized.current
      )
        return

      try {
        const prevData = lastStrengthAverageRef.current

        // Apply forward-fill to ensure time range boundaries exist
        const currentData = prepareDataWithRequiredTimestamps(
          strengthAverage,
          TIME_RANGE_HIGHLIGHTS
        )

        // Detect if this is a historical data prepend (new data has earlier timestamps)
        // This happens when user scrolls back and we lazy-load more history
        let isHistoricalPrepend = false
        let prependedBarsCount = 0
        let savedLogicalRange: LogicalRange | null = null

        if (
          prevData &&
          prevData.length > 0 &&
          currentData.length > prevData.length &&
          chartRef.current
        ) {
          const prevFirstTime = prevData[0]!.time as number
          const currentFirstTime = currentData[0]!.time as number

          // If the new data has an earlier first timestamp, historical data was prepended
          if (currentFirstTime < prevFirstTime) {
            isHistoricalPrepend = true
            // Count how many bars were prepended
            // Find the index in currentData where the old first timestamp appears
            const oldFirstIndex = currentData.findIndex(
              (d) => (d.time as number) >= prevFirstTime
            )
            if (oldFirstIndex > 0) {
              prependedBarsCount = oldFirstIndex
            }
            // Save the current visible logical range before updating
            savedLogicalRange = chartRef.current
              .timeScale()
              .getVisibleLogicalRange()
          }
        }

        // Use efficient update strategy
        const updated = updateSeriesEfficiently(
          strengthAverageSeriesRef.current,
          currentData,
          prevData
        )

        if (updated) {
          lastStrengthAverageRef.current = currentData // Don't spread - keep reference for comparison

          // Update horizontal line series to span the full data range
          // Only needs start and end points to draw horizontal lines
          if (currentData.length > 0) {
            const firstTime = currentData[0]!.time
            const lastTime = currentData[currentData.length - 1]!.time

            // Zero line (y=0)
            if (zeroLineSeriesRef.current) {
              zeroLineSeriesRef.current.setData([
                { time: firstTime, value: 0 },
                { time: lastTime, value: 0 },
              ])
            }

            // +100 line (upper bound)
            if (plus100LineSeriesRef.current) {
              plus100LineSeriesRef.current.setData([
                { time: firstTime, value: 50 },
                { time: lastTime, value: 50 },
              ])
            }

            // -100 line (lower bound)
            if (minus100LineSeriesRef.current) {
              minus100LineSeriesRef.current.setData([
                { time: firstTime, value: -50 },
                { time: lastTime, value: -50 },
              ])
            }
          }

          // Restore scroll position after historical data prepend
          // When historical data is prepended, the logical indices shift
          // We need to adjust the visible range by the number of prepended bars
          if (
            isHistoricalPrepend &&
            savedLogicalRange &&
            prependedBarsCount > 0 &&
            chartRef.current
          ) {
            // Set flag to prevent timeRange effect from overriding our scroll restoration
            skipTimeRangeUpdateRef.current = true

            // Use requestAnimationFrame to ensure the chart has processed setData
            requestAnimationFrame(() => {
              if (chartRef.current && savedLogicalRange) {
                try {
                  // Offset the logical range by the number of prepended bars
                  // This keeps the same data points visible on screen
                  chartRef.current.timeScale().setVisibleLogicalRange({
                    from: savedLogicalRange.from + prependedBarsCount,
                    to: savedLogicalRange.to + prependedBarsCount,
                  })
                } catch {
                  // Scroll position restoration failed - not critical, chart will show default view
                }
              }

              // Clear the flag after a short delay to allow for any pending effects
              setTimeout(() => {
                skipTimeRangeUpdateRef.current = false
              }, 100)
            })
          }
        }

        // Create time markers on first data load
        if (!markersInitialized.current && currentData.length > 0) {
          createTimeMarkers(strengthAverageSeriesRef.current, currentData)
        }

        // Apply time range on first data load (when we had no previous data)
        // Only do this if we have actual data to display
        // Skip if this was a historical prepend (we already handled scroll position above)
        if (
          updated &&
          !prevData &&
          currentData.length > 0 &&
          timeRange &&
          chartRef.current &&
          timeRange.from < timeRange.to
        ) {
          // Use requestAnimationFrame to ensure chart has processed the data
          requestAnimationFrame(() => {
            if (
              chartRef.current &&
              lastStrengthAverageRef.current &&
              lastStrengthAverageRef.current.length > 0 &&
              timeRange &&
              timeRange.from < timeRange.to
            ) {
              try {
                chartRef.current.timeScale().setVisibleRange(timeRange)
              } catch (error) {
                // This can happen if the time range is outside the data bounds
                // Just log and ignore - chart will auto-fit
                console.warn(
                  'Failed to set visible range after data update:',
                  error
                )
              }
            }
          })
        }
      } catch (error) {
        console.warn('Failed to update strength average data:', error)
      }
    }, [strengthAverage, timeRange, name])

    // Update price average series data
    useEffect(() => {
      if (
        !priceAverageSeriesRef.current ||
        !priceAverage ||
        !hasInitialized.current
      )
        return

      try {
        const prevData = lastPriceAverageRef.current

        // Apply forward-fill to ensure time range boundaries exist
        const currentData = prepareDataWithRequiredTimestamps(
          priceAverage,
          TIME_RANGE_HIGHLIGHTS
        )

        // Use efficient update strategy
        const updated = updateSeriesEfficiently(
          priceAverageSeriesRef.current,
          currentData,
          prevData
        )

        if (updated) {
          lastPriceAverageRef.current = currentData
        }
      } catch (error) {
        console.warn('Failed to update price average data:', error)
      }
    }, [priceAverage, name])

    // Update strength indicator series data
    useEffect(() => {
      if (
        !strengthIndicatorSeriesRef.current ||
        !strengthIndicator ||
        !hasInitialized.current
      )
        return

      try {
        const prevData = lastStrengthIndicatorRef.current

        // Apply forward-fill to ensure time range boundaries exist
        const currentData = prepareDataWithRequiredTimestamps(
          strengthIndicator,
          TIME_RANGE_HIGHLIGHTS
        )

        // Use efficient update strategy
        const updated = updateSeriesEfficiently(
          strengthIndicatorSeriesRef.current,
          currentData,
          prevData
        )

        if (updated) {
          lastStrengthIndicatorRef.current = currentData
        }
      } catch (error) {
        console.warn('Failed to update strength indicator data:', error)
      }
    }, [strengthIndicator, name])

    // Update price indicator series data
    useEffect(() => {
      if (
        !priceIndicatorSeriesRef.current ||
        !priceIndicator ||
        !hasInitialized.current
      )
        return

      try {
        const prevData = lastPriceIndicatorRef.current

        // Apply forward-fill to ensure time range boundaries exist
        const currentData = prepareDataWithRequiredTimestamps(
          priceIndicator,
          TIME_RANGE_HIGHLIGHTS
        )

        // Use efficient update strategy
        const updated = updateSeriesEfficiently(
          priceIndicatorSeriesRef.current,
          currentData,
          prevData
        )

        if (updated) {
          lastPriceIndicatorRef.current = currentData
        }
      } catch (error) {
        console.warn('Failed to update price indicator data:', error)
      }
    }, [priceIndicator, name])

    // Update strength interval series data
    // ALWAYS update data, control visibility separately via series.applyOptions
    useEffect(() => {
      if (!hasInitialized.current) return

      try {
        STRENGTH_INTERVALS.forEach((interval) => {
          const series = strengthIntervalSeriesRef.current[interval]
          if (!series) return

          const data = strengthIntervals?.[interval]
          const prevData = lastStrengthIntervalsRef.current[interval]

          if (!data) {
            // Clear the series if no data for this interval
            if (prevData) {
              series.setData([])
              lastStrengthIntervalsRef.current[interval] = null
            }
            return
          }

          // Apply forward-fill to ensure time range boundaries exist
          const currentData = prepareDataWithRequiredTimestamps(
            data,
            TIME_RANGE_HIGHLIGHTS
          )

          // Use efficient update strategy
          const updated = updateSeriesEfficiently(
            series,
            currentData,
            prevData || null
          )

          if (updated) {
            lastStrengthIntervalsRef.current[interval] = currentData
          }

          // Control visibility based on:
          // 1. Master toggle (showStrengthIntervalLines)
          // 2. Per-interval selection (selectedIntervals)
          // Highlight the most important line when aggregate is hidden
          const isSelected = selectedIntervals.includes(interval)
          const isHighlightedInterval = interval === '181' && !showStrengthLine

          series.applyOptions({
            visible: showStrengthIntervalLines && isSelected,
            lineWidth: 1,
            color: isHighlightedInterval
              ? COLORS.strength
              : COLORS[`strength_${interval}` as keyof typeof COLORS] ||
                COLORS.strength_i,
          })
        })
      } catch (error) {
        console.warn('Failed to update strength intervals data:', error)
      }
    }, [
      strengthIntervals,
      showStrengthIntervalLines,
      showStrengthLine,
      selectedIntervals,
      name,
    ])

    // Update price ticker series data (for individual ticker price lines)
    // ALWAYS update data, control visibility separately via series.applyOptions
    useEffect(() => {
      if (!hasInitialized.current || !chartRef.current) return

      try {
        const chart = chartRef.current

        // Create series for new tickers that don't have one yet
        tickers.forEach((ticker) => {
          if (!priceTickerSeriesRef.current[ticker]) {
            const tickerSeries = chart.addSeries(LineSeries, {
              ...getLineSeriesConfig(),
              lineWidth: 1,
              color: COLORS.price_i,
              priceScaleId: 'right', // Use same scale as price average
              visible: showPriceTickerLines, // Set initial visibility
            })
            priceTickerSeriesRef.current[ticker] = tickerSeries
          }
        })

        // Update each ticker series with its data
        tickers.forEach((ticker) => {
          const series = priceTickerSeriesRef.current[ticker]
          if (!series) return

          const data = priceTickers?.[ticker]
          const prevData = lastPriceTickersRef.current[ticker]

          if (!data) {
            // Clear the series if no data for this ticker
            if (prevData) {
              series.setData([])
              lastPriceTickersRef.current[ticker] = null
            }
            return
          }

          // Apply forward-fill to ensure time range boundaries exist
          const currentData = prepareDataWithRequiredTimestamps(
            data,
            TIME_RANGE_HIGHLIGHTS
          )

          // Use efficient update strategy
          const updated = updateSeriesEfficiently(
            series,
            currentData,
            prevData || null
          )

          if (updated) {
            lastPriceTickersRef.current[ticker] = currentData
          }

          // Control visibility based on showPriceTickerLines
          series.applyOptions({
            visible: showPriceTickerLines,
          })
        })

        // Clear data for tickers that are no longer selected
        Object.keys(priceTickerSeriesRef.current).forEach((ticker) => {
          if (!tickers.includes(ticker)) {
            const series = priceTickerSeriesRef.current[ticker]
            if (series && lastPriceTickersRef.current[ticker]) {
              series.setData([])
              lastPriceTickersRef.current[ticker] = null
            }
          }
        })
      } catch (error) {
        console.warn('Failed to update price tickers data:', error)
      }
    }, [priceTickers, showPriceTickerLines, tickers, name])

    // Update chart dimensions when they change
    useEffect(() => {
      if (!chartRef.current || !hasInitialized.current) return

      chartRef.current.applyOptions({
        width,
        height,
      })
    }, [width, height])

    // Subscribe to visible range changes for lazy loading and pause/resume control
    useEffect(() => {
      if (!chartRef.current || !hasInitialized.current) return
      if (!strengthAverageSeriesRef.current) return

      const chart = chartRef.current
      const series = strengthAverageSeriesRef.current

      /**
       * Handle visible logical range changes
       * - Detects when user scrolls near the beginning to trigger lazy loading
       * - Detects when the latest bar is visible/hidden to control polling
       */
      const handleVisibleLogicalRangeChange = (
        logicalRange: LogicalRange | null
      ) => {
        if (!logicalRange) return

        const data = lastStrengthAverageRef.current
        if (!data || data.length === 0) return

        // Get bars info for the visible range
        const barsInfo = series.barsInLogicalRange(logicalRange)
        if (!barsInfo) return

        // Check if we need to load more historical data
        // barsBefore tells us how many bars exist before the visible area
        const now = Date.now()
        const timeSinceLastLoad = now - lastLazyLoadTimeRef.current

        if (
          barsInfo.barsBefore !== null &&
          barsInfo.barsBefore < LAZY_LOAD_BARS_THRESHOLD
        ) {
          // Check why we might not load
          if (isLoadingHistoricalRef.current) {
            // Already loading - this is expected, don't log spam
          } else if (timeSinceLastLoad <= LAZY_LOAD_COOLDOWN_MS) {
            // Cooldown active - don't log spam
          } else {
            // All conditions met - request more history
            lastLazyLoadTimeRef.current = now
            onNeedMoreHistoryRef.current?.()
          }
        }

        // Check if the latest ACTUAL data bar is visible (not the future-padded bars)
        // The data is extended into the future with the last value (FUTURE_PADDING_BARS)
        // So the actual latest data is at index (data.length - 1 - FUTURE_PADDING_BARS)
        // We use a generous buffer to resume polling when user scrolls "near" the end
        const VISIBILITY_BUFFER = 60 // 1 hour buffer - resume polling when within 1 hour of latest data
        const lastActualDataIndex = Math.max(
          0,
          data.length - 1 - FUTURE_PADDING_BARS
        )
        const isLatestBarVisible =
          logicalRange.to >= lastActualDataIndex - VISIBILITY_BUFFER

        // Only notify if visibility changed
        if (isLatestBarVisible !== lastLatestBarVisibleRef.current) {
          lastLatestBarVisibleRef.current = isLatestBarVisible
          onLatestBarVisibilityChangeRef.current?.(isLatestBarVisible)
        }
      }

      // Subscribe to visible range changes
      chart
        .timeScale()
        .subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)

      return () => {
        chart
          .timeScale()
          .unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange)
      }
    }, []) // Empty deps - uses refs for callbacks to avoid re-subscribing

    // Update time range when it changes
    useEffect(() => {
      if (!chartRef.current || !timeRange || !hasInitialized.current) return

      // Skip if we just restored scroll position after historical prepend
      // This prevents the timeRange from overriding our scroll restoration
      if (skipTimeRangeUpdateRef.current) {
        return
      }

      // Validate time range before setting
      if (timeRange.from >= timeRange.to) {
        console.warn('Invalid time range: from >= to', timeRange)
        return
      }

      // Check that we have data in the series before setting visible range
      // setVisibleRange will fail with "Value is null" if series is empty
      if (
        !lastStrengthAverageRef.current ||
        lastStrengthAverageRef.current.length === 0
      ) {
        // No data yet - don't try to set range
        return
      }

      try {
        chartRef.current.timeScale().setVisibleRange(timeRange)
      } catch (error) {
        console.warn('Failed to set visible range:', error)
      }
    }, [timeRange])

    // Toggle visibility of strength average line
    useEffect(() => {
      if (!strengthAverageSeriesRef.current || !hasInitialized.current) return

      strengthAverageSeriesRef.current.applyOptions({
        visible: showStrengthLine,
        lineWidth: 2, // Always prominent when visible (it's the main aggregate line)
      })
    }, [showStrengthLine])

    // Toggle visibility of price average line
    useEffect(() => {
      if (!priceAverageSeriesRef.current || !hasInitialized.current) return

      priceAverageSeriesRef.current.applyOptions({
        visible: showPriceLine,
      })
    }, [showPriceLine])

    // Toggle visibility of strength indicator line
    useEffect(() => {
      if (!strengthIndicatorSeriesRef.current || !hasInitialized.current) return

      strengthIndicatorSeriesRef.current.applyOptions({
        visible: showStrengthIndicatorLine,
      })
    }, [showStrengthIndicatorLine])

    // Toggle visibility of price indicator line
    useEffect(() => {
      if (!priceIndicatorSeriesRef.current || !hasInitialized.current) return

      priceIndicatorSeriesRef.current.applyOptions({
        visible: showPriceIndicatorLine,
      })
    }, [showPriceIndicatorLine])

    const hasData = strengthAverage !== null

    return (
      <div
        key={name}
        id={`chart-${name}`}
        className={classes.Chart}
        style={{
          width: width + 'px',
          position: 'relative',
        }}
      >
        {/* Chart container */}
        <div
          ref={containerRef}
          className={`border border-gray-200 rounded z-10 pr-[10px]`}
        />

        {/* Title floating at top left of chart */}
        <ChartTitle heading={heading} hasData={hasData}>
          <NoDataState />
        </ChartTitle>
      </div>
    )
  }
)

Chart.displayName = 'Chart'
