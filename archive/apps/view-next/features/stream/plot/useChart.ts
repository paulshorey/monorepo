import { useEffect, useRef, MutableRefObject } from 'react'
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeries,
  BarSeries,
} from 'lightweight-charts'
import { VerticalLinePrimitive } from '../../tradingview/lib/primitives/VerticalLinePrimitive'
import { COLORS, SERIES, PRICE_SCALE_RIGHT_OFFSET } from './constants'
import { timeFormatter } from '../lib/time'

// Map seriesType string to Series class
const SERIES_TYPE_MAP = {
  Bar: BarSeries,
  Line: LineSeries,
} as const

export interface SeriesRefs {
  // Main series
  price: MutableRefObject<ISeriesApi<'Bar'> | null>
  cvd: MutableRefObject<ISeriesApi<'Bar'> | null>
  rsi: MutableRefObject<ISeriesApi<'Bar'> | null>
  // OHLC bar series
  evr: MutableRefObject<ISeriesApi<'Bar'> | null>
  vwap: MutableRefObject<ISeriesApi<'Bar'> | null>
  spreadBps: MutableRefObject<ISeriesApi<'Bar'> | null>
  pricePct: MutableRefObject<ISeriesApi<'Bar'> | null>
  // Line series
  bookImbalance: MutableRefObject<ISeriesApi<'Line'> | null>
  volume: MutableRefObject<ISeriesApi<'Line'> | null>
  bigTrades: MutableRefObject<ISeriesApi<'Line'> | null>
  bigVolume: MutableRefObject<ISeriesApi<'Line'> | null>
  vdStrength: MutableRefObject<ISeriesApi<'Line'> | null>
}

export interface AbsorptionRefs {
  markers: MutableRefObject<VerticalLinePrimitive[]>
  timestamps: MutableRefObject<Set<number>>
}

interface UseChartProps {
  containerRef: MutableRefObject<HTMLDivElement | null>
  width: number
  height: number
}

interface UseChartReturn {
  chartRef: MutableRefObject<IChartApi | null>
  seriesRefs: SeriesRefs
  absorptionRefs: AbsorptionRefs
  hasInitialized: MutableRefObject<boolean>
}

export function useChart({
  containerRef,
  width,
  height,
}: UseChartProps): UseChartReturn {
  const chartRef = useRef<IChartApi | null>(null)
  const hasInitialized = useRef(false)

  // Main series refs
  const priceSeriesRef = useRef<ISeriesApi<'Bar'> | null>(null)
  const cvdSeriesRef = useRef<ISeriesApi<'Bar'> | null>(null)
  const rsiSeriesRef = useRef<ISeriesApi<'Bar'> | null>(null)

  // OHLC bar series refs
  const evrSeriesRef = useRef<ISeriesApi<'Bar'> | null>(null)
  const vwapSeriesRef = useRef<ISeriesApi<'Bar'> | null>(null)
  const spreadBpsSeriesRef = useRef<ISeriesApi<'Bar'> | null>(null)
  const pricePctSeriesRef = useRef<ISeriesApi<'Bar'> | null>(null)

  // Line series refs
  const bookImbalanceSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const bigTradesSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const bigVolumeSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const vdStrengthSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

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

    // ========== MAIN SERIES ==========

    if (SERIES?.cvd?.enabled) {
      const cvdSeries = chart.addSeries(
        SERIES_TYPE_MAP[SERIES.cvd.seriesType as keyof typeof SERIES_TYPE_MAP],
        {
          upColor: SERIES.cvd.color,
          downColor: SERIES.cvd.color,
          priceScaleId: 'left',
          priceLineVisible: false,
          lastValueVisible: true,
        }
      ) as ISeriesApi<'Bar'>
      cvdSeries.priceScale().applyOptions({
        scaleMargins: { top: SERIES.cvd.top, bottom: SERIES.cvd.bottom },
        autoScale: true,
      })
      cvdSeriesRef.current = cvdSeries
    }

    if (SERIES?.price?.enabled) {
      const priceSeries = chart.addSeries(
        SERIES_TYPE_MAP[
          SERIES.price.seriesType as keyof typeof SERIES_TYPE_MAP
        ],
        {
          upColor: SERIES.price.color,
          downColor: SERIES.price.color,
          priceScaleId: 'right',
          priceLineVisible: false,
          lastValueVisible: true,
        }
      ) as ISeriesApi<'Bar'>
      priceSeries.priceScale().applyOptions({
        scaleMargins: { top: SERIES.price.top, bottom: SERIES.price.bottom },
        autoScale: true,
      })
      priceSeriesRef.current = priceSeries
    }

    if (SERIES?.rsi?.enabled) {
      const rsiSeries = chart.addSeries(
        SERIES_TYPE_MAP[SERIES.rsi.seriesType as keyof typeof SERIES_TYPE_MAP],
        {
          upColor: SERIES.rsi.color,
          downColor: SERIES.rsi.color,
          priceScaleId: 'rsi',
          priceLineVisible: false,
          lastValueVisible: SERIES.rsi.lastValueVisible ?? false,
        }
      ) as ISeriesApi<'Bar'>
      rsiSeries.priceScale().applyOptions({
        scaleMargins: { top: SERIES.rsi.top, bottom: SERIES.rsi.bottom },
        autoScale: true,
      })
      rsiSeriesRef.current = rsiSeries
    }

    // ========== ADDITIONAL OHLC BAR SERIES ==========

    if (SERIES?.pricePct?.enabled) {
      const pricePctSeries = chart.addSeries(
        SERIES_TYPE_MAP[
          SERIES.pricePct.seriesType as keyof typeof SERIES_TYPE_MAP
        ],
        {
          upColor: SERIES.pricePct.color,
          downColor: SERIES.pricePct.color,
          priceScaleId: 'metrics',
          priceLineVisible: false,
          lastValueVisible: false,
        }
      ) as ISeriesApi<'Bar'>
      pricePctSeries.priceScale().applyOptions({
        scaleMargins: {
          top: SERIES.pricePct.top,
          bottom: SERIES.pricePct.bottom,
        },
        autoScale: true,
      })
      pricePctSeriesRef.current = pricePctSeries
    }
    if (SERIES?.evr?.enabled) {
      const evrSeries = chart.addSeries(
        SERIES_TYPE_MAP[SERIES.evr.seriesType as keyof typeof SERIES_TYPE_MAP],
        {
          upColor: SERIES.evr.color,
          downColor: SERIES.evr.color,
          priceScaleId: 'metrics',
          priceLineVisible: false,
          lastValueVisible: false,
        }
      ) as ISeriesApi<'Bar'>
      evrSeriesRef.current = evrSeries
    }
    if (SERIES?.vwap?.enabled) {
      const vwapSeries = chart.addSeries(
        SERIES_TYPE_MAP[SERIES.vwap.seriesType as keyof typeof SERIES_TYPE_MAP],
        {
          upColor: SERIES.vwap.color,
          downColor: SERIES.vwap.color,
          priceScaleId: 'right',
          priceLineVisible: false,
          lastValueVisible: false,
        }
      ) as ISeriesApi<'Bar'>
      vwapSeriesRef.current = vwapSeries
    }

    if (SERIES?.spreadBps?.enabled) {
      const spreadBpsSeries = chart.addSeries(
        SERIES_TYPE_MAP[
          SERIES.spreadBps.seriesType as keyof typeof SERIES_TYPE_MAP
        ],
        {
          upColor: SERIES.spreadBps.color,
          downColor: SERIES.spreadBps.color,
          priceScaleId: 'spreadBps',
          priceLineVisible: false,
          lastValueVisible: false,
        }
      ) as ISeriesApi<'Bar'>
      spreadBpsSeries.priceScale().applyOptions({
        scaleMargins: {
          top: SERIES.spreadBps.top,
          bottom: SERIES.spreadBps.bottom,
        },
        autoScale: true,
      })
      spreadBpsSeriesRef.current = spreadBpsSeries
    }

    // ========== LINE SERIES ==========

    if (SERIES?.bookImbalance?.enabled) {
      const bookImbalanceSeries = chart.addSeries(
        SERIES_TYPE_MAP[
          SERIES.bookImbalance.seriesType as keyof typeof SERIES_TYPE_MAP
        ],
        {
          color: SERIES.bookImbalance.color,
          lineWidth: 1,
          priceScaleId: 'bookImbalance',
          crosshairMarkerVisible: true,
          priceLineVisible: false,
          lastValueVisible: false,
        }
      ) as ISeriesApi<'Line'>
      bookImbalanceSeries.priceScale().applyOptions({
        scaleMargins: {
          top: SERIES.bookImbalance.top,
          bottom: SERIES.bookImbalance.bottom,
        },
        autoScale: true,
      })
      bookImbalanceSeriesRef.current = bookImbalanceSeries
    }

    if (SERIES?.volume?.enabled) {
      const volumeSeries = chart.addSeries(
        SERIES_TYPE_MAP[
          SERIES.volume.seriesType as keyof typeof SERIES_TYPE_MAP
        ],
        {
          color: SERIES.volume.color,
          lineWidth: 1,
          priceScaleId: 'volume',
          crosshairMarkerVisible: true,
          priceLineVisible: false,
          lastValueVisible: false,
        }
      ) as ISeriesApi<'Line'>
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: SERIES.volume.top,
          bottom: SERIES.volume.bottom,
        },
        autoScale: true,
      })
      volumeSeriesRef.current = volumeSeries
    }

    if (SERIES?.bigTrades?.enabled) {
      const bigTradesSeries = chart.addSeries(
        SERIES_TYPE_MAP[
          SERIES.bigTrades.seriesType as keyof typeof SERIES_TYPE_MAP
        ],
        {
          color: SERIES.bigTrades.color,
          lineWidth: 1,
          priceScaleId: 'bigTrades',
          crosshairMarkerVisible: true,
          priceLineVisible: false,
          lastValueVisible: false,
        }
      ) as ISeriesApi<'Line'>
      bigTradesSeries.priceScale().applyOptions({
        scaleMargins: {
          top: SERIES.bigTrades.top,
          bottom: SERIES.bigTrades.bottom,
        },
        autoScale: true,
      })
      bigTradesSeriesRef.current = bigTradesSeries
    }

    if (SERIES?.bigVolume?.enabled) {
      const bigVolumeSeries = chart.addSeries(
        SERIES_TYPE_MAP[
          SERIES.bigVolume.seriesType as keyof typeof SERIES_TYPE_MAP
        ],
        {
          color: SERIES.bigVolume.color,
          lineWidth: 1,
          priceScaleId: 'bigVolume',
          crosshairMarkerVisible: true,
          priceLineVisible: false,
          lastValueVisible: false,
        }
      ) as ISeriesApi<'Line'>
      bigVolumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: SERIES.bigVolume.top,
          bottom: SERIES.bigVolume.bottom,
        },
        autoScale: true,
      })
      bigVolumeSeriesRef.current = bigVolumeSeries
    }

    if (SERIES?.vdStrength?.enabled) {
      const vdStrengthSeries = chart.addSeries(
        SERIES_TYPE_MAP[
          SERIES.vdStrength.seriesType as keyof typeof SERIES_TYPE_MAP
        ],
        {
          color: SERIES.vdStrength.color,
          lineWidth: 1,
          priceScaleId: 'vdStrength',
          crosshairMarkerVisible: true,
          priceLineVisible: false,
          lastValueVisible: false,
        }
      ) as ISeriesApi<'Line'>
      vdStrengthSeries.priceScale().applyOptions({
        scaleMargins: {
          top: SERIES.vdStrength.top,
          bottom: SERIES.vdStrength.bottom,
        },
        autoScale: true,
      })
      vdStrengthSeriesRef.current = vdStrengthSeries
    }

    // Track mouse position for zoom anchor (wheel event clientX/Y is unreliable for trackpad pinch)
    let lastMouseX: number | null = null

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (containerRect) {
        lastMouseX = e.clientX - containerRect.left
      }
    }

    const handleMouseLeave = () => {
      lastMouseX = null
    }

    // Custom zoom handler anchored at cursor position
    const handleWheel = (e: WheelEvent) => {
      const isZoomGesture = e.ctrlKey || e.metaKey
      if (!isZoomGesture) return

      e.preventDefault()
      e.stopPropagation()

      const timeScale = chart.timeScale()
      const visibleRange = timeScale.getVisibleLogicalRange()
      if (!visibleRange) return

      // Use tracked mouse position (more reliable than wheel event clientX for trackpad)
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      // Fall back to wheel event position if mouse tracking hasn't captured position yet
      const cursorX = lastMouseX ?? e.clientX - containerRect.left

      // Convert cursor X to logical index
      const cursorLogical = timeScale.coordinateToLogical(cursorX)
      if (cursorLogical === null) return

      const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95

      const currentFrom = visibleRange.from
      const currentTo = visibleRange.to
      const currentWidth = currentTo - currentFrom

      // Calculate cursor position as fraction of visible range (0 = left, 1 = right)
      const cursorFraction = (cursorLogical - currentFrom) / currentWidth

      const newWidth = currentWidth * zoomFactor

      const minBars = 10
      const maxBars = 50000
      if (newWidth < minBars || newWidth > maxBars) return

      // Anchor at cursor: keep cursorLogical at the same screen position
      const newFrom = cursorLogical - cursorFraction * newWidth
      const newTo = newFrom + newWidth

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

      const dx = touch1.clientX - touch0.clientX
      const dy = touch1.clientY - touch0.clientY
      const currentDistance = Math.sqrt(dx * dx + dy * dy)
      const currentMidpointX = (touch0.clientX + touch1.clientX) / 2

      const timeScale = chart.timeScale()
      const visibleRange = timeScale.getVisibleLogicalRange()
      if (!visibleRange) return

      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return
      const anchorX = currentMidpointX - containerRect.left

      const anchorLogical = timeScale.coordinateToLogical(anchorX)
      if (anchorLogical === null) return

      // Spreading fingers apart = zoom in (smaller factor)
      const zoomFactor = lastPinchDistance / currentDistance

      const currentFrom = visibleRange.from
      const currentTo = visibleRange.to
      const currentWidth = currentTo - currentFrom
      const anchorFraction = (anchorLogical - currentFrom) / currentWidth

      const newWidth = currentWidth * zoomFactor

      const minBars = 10
      const maxBars = 50000
      if (newWidth < minBars || newWidth > maxBars) return

      const newFrom = anchorLogical - anchorFraction * newWidth
      const newTo = newFrom + newWidth

      timeScale.setVisibleLogicalRange({
        from: newFrom,
        to: newTo,
      })

      lastPinchDistance = currentDistance
      lastPinchMidpointX = currentMidpointX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastPinchDistance = null
        lastPinchMidpointX = null
      }
    }

    const container = containerRef.current
    container.addEventListener('mousemove', handleMouseMove, { passive: true })
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
      // Main series
      priceSeriesRef.current = null
      cvdSeriesRef.current = null
      rsiSeriesRef.current = null
      // OHLC bar series
      pricePctSeriesRef.current = null
      evrSeriesRef.current = null
      vwapSeriesRef.current = null
      spreadBpsSeriesRef.current = null
      // Line series
      bookImbalanceSeriesRef.current = null
      volumeSeriesRef.current = null
      bigTradesSeriesRef.current = null
      bigVolumeSeriesRef.current = null
      vdStrengthSeriesRef.current = null
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

  return {
    chartRef,
    seriesRefs: {
      price: priceSeriesRef,
      cvd: cvdSeriesRef,
      rsi: rsiSeriesRef,
      pricePct: pricePctSeriesRef,
      evr: evrSeriesRef,
      vwap: vwapSeriesRef,
      spreadBps: spreadBpsSeriesRef,
      bookImbalance: bookImbalanceSeriesRef,
      volume: volumeSeriesRef,
      bigTrades: bigTradesSeriesRef,
      bigVolume: bigVolumeSeriesRef,
      vdStrength: vdStrengthSeriesRef,
    },
    absorptionRefs: {
      markers: absorptionMarkersRef,
      timestamps: absorptionTimestampsRef,
    },
    hasInitialized,
  }
}
