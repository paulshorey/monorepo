import { Candle } from '@/lib/market-data/candles'
import { BarData, LineData, Time } from 'lightweight-charts'
import {
  indicatorRSI,
  indicatorRSI_OHLC,
  pivotPoints,
  indicatorTR,
} from '../lib/indicators'

// API Configuration
export const TICKER = 'ES'
export const POLL_INTERVAL_MS = 1000
export const RECENT_CANDLES = 22 // I guess it needs to be enough to indicator indicators
export const RSI_PERIOD = 14
export const ATR_PERIOD = 5

// Lazy loading thresholds
// Number of bars before visible area that triggers loading more historical data
export const LAZY_LOAD_BARS_THRESHOLD = 1
// Number of hours of historical data to fetch per lazy load request
export const LAZY_LOAD_FETCH_HOURS = 24
// Cooldown between lazy load requests (in ms)
export const LAZY_LOAD_COOLDOWN_MS = 2000

// Extra width to extend chart past screen edge, pushing price scale's internal padding off-screen
// This makes the price numbers appear flush against the right edge
// Value is in scaled pixels (at 2x scale factor, 20px = 10px visual on screen)
export const PRICE_SCALE_RIGHT_OFFSET = 20

// UI colors
export const COLORS = {
  background: '#1a1a2e',
  text: '#C3BCDB',
  gridLine: '#333344',
  crosshair: '#71649C',
}

// Series configuration type
export interface SeriesConfig {
  seriesType: 'Bar' | 'Line'
  enabled: boolean
  color: string
  top: number
  bottom: number
  priceScaleId: string
  lastValueVisible?: boolean
  applyScaleMargins?: boolean
  formatter: (candles: Candle[]) => BarData[] | LineData[]
}

// Series configuration: enabled, color, scale margins (top/bottom), and chart options
// Set `enabled: false` to hide a series from the chart
export const SERIES: Record<string, SeriesConfig> = {
  // OHLC
  price: {
    seriesType: 'Bar',
    enabled: true,
    color: 'hsl(221.01 100% 72.75%)',
    top: 0.05,
    bottom: 0.25,
    priceScaleId: 'right',
    lastValueVisible: true,
    formatter: function (candles: Candle[]): BarData[] {
      return candles.map((candle) => ({
        time: (candle.time / 1000) as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
    },
  },
  cvd: {
    seriesType: 'Bar',
    enabled: true,
    color: 'hsla(115.87 100% 62.94% / 0.75)',
    top: 0.125,
    bottom: 0.5,
    priceScaleId: 'cvd',
    lastValueVisible: false,
    formatter: function (candles: Candle[]): BarData[] {
      return candles.map((candle) => ({
        time: (candle.time / 1000) as Time,
        open: -candle.cvd_open,
        high: -candle.cvd_low, // Inverted: low becomes high
        low: -candle.cvd_high, // Inverted: high becomes low
        close: -candle.cvd_close,
      }))
    },
  },
  rsi_ohlc: {
    seriesType: 'Bar',
    enabled: true,
    color: 'hsla(40 100% 50% / 0.5)',
    top: 0.35,
    bottom: 0.15,
    priceScaleId: 'rsi',
    lastValueVisible: true,
    formatter: function (candles: Candle[]): BarData[] {
      return indicatorRSI_OHLC(candles, RSI_PERIOD)
    },
  },

  // LINE
  rsi: {
    seriesType: 'Line',
    enabled: true,
    color: 'hsla(40 100% 50% / 0.75)',
    top: 0.35,
    bottom: 0.15,
    priceScaleId: 'rsi',
    lastValueVisible: true,
    formatter: function (candles: Candle[]): LineData[] {
      return indicatorRSI(candles, RSI_PERIOD)
    },
  },
  pivots: {
    seriesType: 'Line',
    enabled: true,
    color: 'hsl(60 100% 70%)',
    top: 0,
    bottom: 0.95,
    priceScaleId: 'pivots',
    formatter: function (candles: Candle[]): LineData[] {
      return pivotPoints(candles, 20)
    },
  },

  // LINE ALONG THE BOTTOM EDGE (0-based, upwards unbounded)
  atr: {
    seriesType: 'Line',
    enabled: true,
    color: 'hsl(180 70% 50%)',
    top: 0.8,
    bottom: 0,
    priceScaleId: 'atr',
    formatter: function (candles: Candle[]): LineData[] {
      return indicatorTR(candles)
    },
  },
  volume: {
    seriesType: 'Line',
    enabled: true,
    color: 'hsl(50 100% 100%)',
    top: 0.8,
    bottom: 0,
    priceScaleId: 'volume',
    formatter: function (candles: Candle[]): LineData[] {
      const rsi = indicatorRSI(candles, 70, 'volume')
      return rsi.map((candle) => ({
        time: candle.time as Time,
        value: candle.value,
      }))
    },
  },
  bigTrades: {
    seriesType: 'Line',
    enabled: true,
    color: 'hsl(320 70% 55%)',
    top: 0.8,
    bottom: 0,
    priceScaleId: 'bigTrades',
    formatter: function (candles: Candle[]): LineData[] {
      return candles.map((candle) => ({
        time: (candle.time / 1000) as Time,
        value: candle.big_trades,
      }))
    },
  },
  bigVolume: {
    seriesType: 'Line',
    enabled: false,
    color: 'hsl(260 60% 60%)',
    top: 0.8,
    bottom: 0,
    priceScaleId: 'bigVolume',
    formatter: function (candles: Candle[]): LineData[] {
      return candles.map((candle) => ({
        time: (candle.time / 1000) as Time,
        value: candle.big_volume,
      }))
    },
  },
}

// Export type for series keys
export type SeriesKey = keyof typeof SERIES

// Helper to get series keys as array
export const SERIES_KEYS = Object.keys(SERIES) as SeriesKey[]

// Absorption marker configuration
export const ABSORPTION_MARKER = {
  color: 'hsla(50, 100%, 50%, 0.8)',
  width: 1,
  labelText: '',
  labelBackgroundColor: 'hsla(50, 100%, 40%, 0.9)',
  labelTextColor: 'white',
  showLabel: false,
  lineStyle: 'dotted' as const,
}

export const BASE_CANDLES_URL = `/api/v1/market-data/candles?ticker=${TICKER}&timeframe=1m`

export function buildCandlesUrl(limit: number) {
  return `${BASE_CANDLES_URL}&limit=${limit}`
}

export function buildCandlesUrlRange(startMs: number, endMs: number) {
  return `${BASE_CANDLES_URL}&start=${startMs}&end=${endMs}`
}
