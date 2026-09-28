import { useEffect, useRef, MutableRefObject } from 'react'
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeries,
  BarSeries,
  LogicalRange,
} from 'lightweight-charts'
import { VerticalLinePrimitive } from '../../tradingview/lib/primitives/VerticalLinePrimitive'
import type { Candle } from '@/lib/market-data/candles'
import {
  COLORS,
  SERIES,
  PRICE_SCALE_RIGHT_OFFSET,
  SeriesKey,
} from './constants'
import { timeFormatter } from '../lib/time'

// Map seriesType string to Series class
const SERIES_TYPE_MAP = {
  Bar: BarSeries,
  Line: LineSeries,
} as const

// Series refs type - all series use Bar | Line union for simplicity
export type SeriesRefs = {
  [K in SeriesKey]: MutableRefObject<ISeriesApi<'Bar' | 'Line'> | null>
}

export interface AbsorptionRefs {
  markers: MutableRefObject<VerticalLinePrimitive[]>
  timestamps: MutableRefObject<Set<number>>
}

// Buffer (in logical bar indices) for determining if the latest bar is "visible".
// When the visible range's right edge is within this many bars of the last data point,
// we consider the chart to be in "real-time mode" (zoom anchors at right edge).
const LATEST_BAR_VISIBILITY_BUFFER = 10

// After a ctrl/cmd+scroll zoom gesture ends, suppress regular scroll events for
// this duration to prevent macOS trackpad momentum from panning the chart.
const ZOOM_COOLDOWN_MS = 400

interface UseInitChartProps {
  containerRef: MutableRefObject<HTMLDivElement | null>
  dataRef: MutableRefObject<Candle[]>
  width: number
  height: number
}

interface UseInitChartReturn {
  chartRef: MutableRefObject<IChartApi | null>
  seriesRefs: SeriesRefs
  absorptionRefs: AbsorptionRefs
  hasInitialized: MutableRefObject<boolean>
  latestBarVisibleRef: MutableRefObject<boolean>
}

export function useInitChart({
  containerRef,
  dataRef,
  width,
  height,
}: UseInitChartProps): UseInitChartReturn {
  const chartRef = useRef<IChartApi | null>(null)
  const hasInitialized = useRef(false)

  // Tracks whether the latest data bar is within the visible range.
  // true  → real-time mode: zoom anchors at the right edge (last candle stays fixed)
  // false → historical mode: zoom anchors at the cursor position
  const latestBarVisibleRef = useRef(true)

  // Create refs for all series dynamically
  // Using useRef with an object that persists across renders
  const seriesRefsMap = useRef<
    Record<string, ISeriesApi<'Bar' | 'Line'> | null>
  >(Object.fromEntries(Object.keys(SERIES).map((key) => [key, null])))

  // Absorption marker refs
  const absorptionMarkersRef = useRef<VerticalLinePrimitive[]>([])
  const absorptionTimestampsRef = useRef<Set<number>>(new Set())

  // Create chart on mount
  useEffect(() => {
    if (!containerRef.current || hasInitialized.current) return

    const chartWidth = width + PRICE_SCALE_RIGHT_OFFSET

    const chart = createChart(containerRef.current, {
      width: chartWidth,
      height,
      layout: {
        background: { color: COLORS.background },
        textColor: COLORS.text,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: COLORS.gridLine },
      },
      rightPriceScale: {
        visible: true,
        minimumWidth: 80,
        borderVisible: false,
      },
      leftPriceScale: {
        visible: false,
        minimumWidth: 50,
        borderVisible: false,
      },
      timeScale: {
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: timeFormatter,
        borderVisible: false,
        rightBarStaysOnScroll: true,
      },
      crosshair: {
        mode: 0,
        vertLine: {
          visible: true,
          color: COLORS.crosshair,
          width: 1,
          style: 0,
        },
        horzLine: {
          visible: true,
          color: COLORS.crosshair,
          width: 1,
          style: 0,
        },
      },
      handleScroll: true,
      handleScale: false,
      localization: {
        timeFormatter,
      },
    })

    chartRef.current = chart
    hasInitialized.current = true

    // Initialize all series from SERIES config
    for (const [key, config] of Object.entries(SERIES)) {
      if (!config.enabled) continue

      const isBarSeries = config.seriesType === 'Bar'
      const SeriesClass = SERIES_TYPE_MAP[config.seriesType]

      // Build series options based on type
      const seriesOptions = {
        priceScaleId: config.priceScaleId,
        priceLineVisible: false,
        lastValueVisible: config.lastValueVisible ?? false,
        ...(isBarSeries
          ? { upColor: config.color, downColor: config.color }
          : {
              color: config.color,
              lineWidth: 1,
              crosshairMarkerVisible: true,
            }),
      }

      const series = chart.addSeries(SeriesClass, seriesOptions)

      // Apply scale margins unless explicitly disabled
      if (config.applyScaleMargins !== false) {
        series.priceScale().applyOptions({
          scaleMargins: { top: config.top, bottom: config.bottom },
          autoScale: true,
        })
      }

      seriesRefsMap.current[key] = series
    }

    // ---------------------------------------------------------------
    // Zoom handling with adaptive anchor point
    // ---------------------------------------------------------------
    // Track mouse position for cursor-anchored zoom in historical mode.
    // We track from original (unpatched) mouse events and apply the
    // scale factor ourselves, since useEventPatcher patches mouse events
    // separately for the chart library's coordinate system.
    let lastMouseX: number | null = null
    // Timestamp of the last zoom gesture, used to suppress macOS trackpad
    // momentum scroll events that fire after the user releases ctrl/cmd.
    let lastZoomTime = 0

    const handleMouseMove = (e: MouseEvent) => {
      // Skip patched events dispatched by useEventPatcher
      if ((e as any)._patched) return
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (containerRect) {
        const scale = (window as any).scaleFactor || 1
        lastMouseX = (e.clientX - containerRect.left) * scale
      }
    }

    const handleMouseLeave = () => {
      lastMouseX = null
    }

    // Custom zoom handler with adaptive anchor point:
    // - Real-time mode (latest bar visible): anchor at right edge of visible range,
    //   so the last candle stays fixed and zoom expands/contracts into history.
    // - Historical mode (scrolled back): anchor at cursor position on x-axis,
    //   so the point under the cursor stays fixed during zoom.
    // Requires ctrl (Windows/Linux) or cmd (Mac) + scroll wheel to zoom.
    const handleWheel = (e: WheelEvent) => {
      const isZoomGesture = e.ctrlKey || e.metaKey

      if (isZoomGesture) {
        lastZoomTime = Date.now()
      } else if (Date.now() - lastZoomTime < ZOOM_COOLDOWN_MS) {
        // Suppress momentum scroll events that follow a zoom gesture.
        // On macOS, trackpad momentum events may lose the modifier key,
        // causing lightweight-charts to interpret them as horizontal pan.
        e.preventDefault()
        e.stopPropagation()
        return
      } else {
        return // Regular scroll — let lightweight-charts handle pan
      }

      e.preventDefault()
      e.stopPropagation()

      const timeScale = chart.timeScale()
      const visibleRange = timeScale.getVisibleLogicalRange()
      if (!visibleRange) return

      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      const dataLength = dataRef.current.length
      if (dataLength === 0) return

      // Current visible range
      const currentFrom = visibleRange.from
      const currentTo = visibleRange.to
      const currentWidth = currentTo - currentFrom

      // Determine anchor point based on whether latest bar is visible
      let anchorLogical: number

      if (latestBarVisibleRef.current) {
        // Real-time mode: anchor at the right edge of the visible range.
        // This keeps the last candle fixed — all expansion/contraction
        // happens on the left side (into history).
        anchorLogical = currentTo
      } else {
        // Historical mode: anchor at cursor position
        const scale = (window as any).scaleFactor || 1
        const cursorX =
          lastMouseX ?? (e.clientX - containerRect.left) * scale
        const cursorLogicalVal = timeScale.coordinateToLogical(cursorX)
        if (cursorLogicalVal === null) return
        anchorLogical = cursorLogicalVal
      }

      // Calculate anchor position as fraction of visible range (0 = left, 1 = right)
      const anchorFraction = (anchorLogical - currentFrom) / currentWidth

      // Zoom factor based on wheel delta (smaller factor = smoother zoom)
      const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95

      const newWidth = currentWidth * zoomFactor

      // Zoom limits
      const minBars = 10
      const maxBars = 50000
      if (newWidth < minBars || newWidth > maxBars) return

      // Anchor zoom: keep anchorLogical at the same screen position
      let newFrom = anchorLogical - anchorFraction * newWidth
      let newTo = newFrom + newWidth

      // In real-time mode, clamp the right edge to prevent extending
      // beyond the data range (avoid empty future space on zoom-out)
      if (latestBarVisibleRef.current && dataLength > 0) {
        const maxTo = dataLength - 1
        if (newTo > maxTo) {
          newTo = maxTo
          newFrom = newTo - newWidth
        }
      }

      timeScale.setVisibleLogicalRange({
        from: newFrom,
        to: newTo,
      })
    }

    // ---------------------------------------------------------------
    // Pinch-to-zoom for mobile (same adaptive anchor logic)
    // ---------------------------------------------------------------
    let lastPinchDistance: number | null = null
    let lastPinchMidpointX: number | null = null

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch0 = e.touches[0]
        const touch1 = e.touches[1]
        if (!touch0 || !touch1) return
        const dx = touch1.clientX - touch0.clientX
        const dy = touch1.clientY - touch0.clientY
        lastPinchDistance = Math.sqrt(dx * dx + dy * dy)
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

      const dataLength = dataRef.current.length
      if (dataLength === 0) return

      const currentFrom = visibleRange.from
      const currentTo = visibleRange.to
      const currentWidth = currentTo - currentFrom

      // Determine anchor point based on mode
      let anchorLogical: number

      if (latestBarVisibleRef.current) {
        // Real-time mode: anchor at right edge
        anchorLogical = currentTo
      } else {
        // Historical mode: anchor at pinch midpoint
        const scale = (window as any).scaleFactor || 1
        const relativeX = currentMidpointX - containerRect.left
        const anchorX = relativeX * scale
        const anchorLogicalVal = timeScale.coordinateToLogical(anchorX)
        if (anchorLogicalVal === null) return
        anchorLogical = anchorLogicalVal
      }

      // Calculate anchor position as fraction of visible range
      const anchorFraction = (anchorLogical - currentFrom) / currentWidth

      // Inverted: spreading fingers apart (larger distance) = zoom in (smaller factor)
      const zoomFactor = lastPinchDistance / currentDistance

      const newWidth = currentWidth * zoomFactor

      // Zoom limits
      const minBars = 10
      const maxBars = 50000
      if (newWidth < minBars || newWidth > maxBars) return

      // Anchor zoom: keep anchorLogical at the same screen position
      let newFrom = anchorLogical - anchorFraction * newWidth
      let newTo = newFrom + newWidth

      // In real-time mode, clamp the right edge
      if (latestBarVisibleRef.current && dataLength > 0) {
        const maxTo = dataLength - 1
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

    // ---------------------------------------------------------------
    // Latest bar visibility tracking
    // ---------------------------------------------------------------
    // Subscribe to visible range changes to determine whether we're in
    // "real-time mode" (latest bar visible → anchor zoom at right edge)
    // or "historical mode" (scrolled back → anchor zoom at cursor).
    const handleVisibleRangeChange = (logicalRange: LogicalRange | null) => {
      if (!logicalRange) return
      const dataLength = dataRef.current.length
      if (dataLength === 0) return

      const lastDataIndex = dataLength - 1
      const isVisible =
        logicalRange.to >= lastDataIndex - LATEST_BAR_VISIBILITY_BUFFER

      latestBarVisibleRef.current = isVisible
    }

    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(handleVisibleRangeChange)

    // ---------------------------------------------------------------
    // Event listeners
    // ---------------------------------------------------------------
    const container = containerRef.current
    container.addEventListener('mousemove', handleMouseMove, {
      passive: true,
      capture: true,
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

    return () => {
      container.removeEventListener('mousemove', handleMouseMove, {
        capture: true,
      })
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
      chart
        .timeScale()
        .unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange)
      chart.remove()
      chartRef.current = null
      // Clear all series refs
      for (const key of Object.keys(SERIES)) {
        seriesRefsMap.current[key] = null
      }
      // Absorption markers
      absorptionMarkersRef.current = []
      absorptionTimestampsRef.current.clear()
      hasInitialized.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update chart dimensions
  useEffect(() => {
    if (!chartRef.current || !hasInitialized.current) return
    chartRef.current.applyOptions({
      width: width + PRICE_SCALE_RIGHT_OFFSET,
      height,
    })
  }, [width, height])

  // Create stable ref objects for each series key
  // This provides the same interface as before (seriesRefs.price.current, etc.)
  const seriesRefs = Object.fromEntries(
    Object.keys(SERIES).map((key) => [
      key,
      {
        get current() {
          return seriesRefsMap.current[key] ?? null
        },
        set current(value) {
          seriesRefsMap.current[key] = value
        },
      },
    ])
  ) as SeriesRefs

  return {
    chartRef,
    seriesRefs,
    absorptionRefs: {
      markers: absorptionMarkersRef,
      timestamps: absorptionTimestampsRef,
    },
    hasInitialized,
    latestBarVisibleRef,
  }
}
