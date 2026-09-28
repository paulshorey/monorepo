import {
  DeepPartial,
  ChartOptions,
  Time,
  LineStyleOptions,
  SeriesOptionsCommon,
} from 'lightweight-charts'
import { COLORS } from '../constants'

function timeFormatter(time: Time) {
  // Convert the time (which is in seconds since epoch) to milliseconds
  const date = new Date((time as number) * 1000)
  // Format the time in the user's local time zone
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  const month = (date.getMonth() + 1).toString()
  const day = date.getDate().toString()
  return `${month}/${day} ${hours}:${minutes}`
}

/**
 * Get base chart configuration
 */
export const getChartConfig = (height: number): DeepPartial<ChartOptions> => ({
  overlayPriceScales: {},
  height: height, // Use full height passed from parent
  localization: {
    timeFormatter,
  },
  layout: {
    background: { color: COLORS.background },
    textColor: COLORS.text,
    attributionLogo: false, // Hide TradingView logo
  },
  grid: {
    vertLines: { visible: false }, // Hide vertical grid lines to reduce clutter
    horzLines: { color: COLORS.gridLine },
  },
  // Y-Axis - Enable both left and right scales for dual series
  rightPriceScale: {
    visible: false,
    minimumWidth: 80,
  },
  leftPriceScale: {
    visible: false,
    minimumWidth: 80,
  },
  // X-Axis
  timeScale: {
    visible: true,
    timeVisible: true,
    secondsVisible: false,
    tickMarkFormatter: timeFormatter,
    rightBarStaysOnScroll: true, // Keep right bar visible when scrolling
  },
  crosshair: {
    mode: 0, // Normal mode: we'll set Y explicitly via setCrosshairPosition
    vertLine: {
      visible: true,
      color: COLORS.crosshair,
      width: 1,
      style: 0, // Solid line
    },
    horzLine: {
      visible: true,
      color: COLORS.crosshair,
      width: 1,
      style: 0, // Solid line
    },
  },
  // Disable zoom/scroll but allow crosshair interactions
  handleScroll: true,
  handleScale: false,
})

/**
 * Get line series configuration
 */
export const getLineSeriesConfig = (): DeepPartial<
  LineStyleOptions & SeriesOptionsCommon
> => ({
  color: '#e8850d',
  crosshairMarkerBackgroundColor: 'transparent',
  crosshairMarkerBorderColor: 'transparent',
  crosshairMarkerBorderWidth: 0,
  crosshairMarkerVisible: true,
  priceLineVisible: false, // Hide horizontal price line
  lastValueVisible: false, // Hide last value label
})
