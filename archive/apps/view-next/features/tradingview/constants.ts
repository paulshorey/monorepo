import { TimeMarkerConfig } from './lib/primitives/timeMarkers'
import { TimeRangeConfig } from './lib/primitives/TimeRangeHighlight'

export const SCALE_FACTOR_DESKTOP = 2
export const SCALE_FACTOR_MOBILE = 2

// Fetch this much data from the database (supports lazy loading of historical data)
export const FETCH_DATA_HOURS_BACK = 240
export const FETCH_DATA_ROWS = 7250

// Initial visible range in hours (users can zoom in/out from this)
export const INITIAL_VISIBLE_HOURS = 24

// Time in ms to wait after user stops scrolling before resuming polling
// Note: This is now less important as we use smart pause/resume based on visible range
export const SCROLL_PAUSE_RESUME_MS = 300000 // 5 minutes (fallback)

// Lazy loading thresholds
// Number of bars before visible area that triggers loading more historical data
export const LAZY_LOAD_BARS_THRESHOLD = 30
// Number of hours of historical data to fetch when lazy loading
// Should match FETCH_DATA_HOURS_BACK for consistent chunk sizes
export const LAZY_LOAD_FETCH_HOURS = FETCH_DATA_HOURS_BACK // 240 hours = 10 days per load
// Cooldown between lazy load requests (in ms)
export const LAZY_LOAD_COOLDOWN_MS = 2000

// Future padding - extend chart data into the future for visualization
// This allows users to scroll into "future" time to see where the current trend might go
export const FUTURE_PADDING_HOURS = 12
export const FUTURE_PADDING_BARS = FUTURE_PADDING_HOURS * 60 // Convert to minutes (bars)

export const SHOW_0_LINE = false
export const SHOW_100_LINES = false

// Color palette - Dark theme
export const COLORS = {
  // Chart background and layout
  background: '#1a1a2e',
  text: '#C3BCDB',
  gridLine: '#333344',
  crosshair: '#71649C',
  // Series colors
  red: 'hsl(0 75.53% 53.53%)',
  green: 'hsl(120 70.8% 44.31%)',
  purple: 'hsl(275 85% 70%)', // Purple
  dark: '#555566',
  neutral: '#888899',
  // Indicator
  indicator: 'hsl(120 70.8% 44.31%)',
  // Strength
  strength: 'hsl(35 100% 50%)', // Orange
  // Price
  price: 'hsl(233 100% 75%)', // Blue
  // Etc
  light: '#55556666', // Light gray (for dark theme)

  // Individual lines (lighter versions)
  strength_i: 'hsla(35 100% 50% / 0.55)', // Orange transparent
  strength_ii: 'hsla(35 100% 50% / 0.44)', // Orange transparent
  strength_iii: 'hsla(35 100% 50% / 0.22)', // Orange transparent

  strength_1: 'hsla(35 100% 50% / 0.25)', // Orange
  strength_3: 'hsla(35 100% 50% / 0.3)', // Orange
  strength_5: 'hsla(35 100% 50% / 0.35)', // Orange
  strength_7: 'hsla(35 100% 50% / 0.4)', // Orange
  strength_13: 'hsla(35 100% 50% / 0.45)', // Orange
  strength_29: 'hsla(35 100% 50% / 0.5)', // Orange
  strength_59: 'hsla(35 100% 50% / 0.6)', // Orange
  strength_109: 'hsla(35 100% 50% / 0.7)', // Orange
  strength_181: 'hsla(35 100% 50% / 0.8)', // Orange
  strength_D: 'hsla(35 100% 50% / 0.5)', // Orange
  strength_W: 'hsla(35 100% 50% / 0.5)', // Orange

  // price_i: 'hsla(275 85% 70% / 0.5)', // Purple transparent
  price_i: 'hsla(233 100% 75% / 0.67)', // Blue transparent
  light_i: '#33334455',
}

// Time markers - vertical lines on the chart
export const TIME_MARKERS: TimeMarkerConfig[] = [
  {
    label: '8am',
    utcHour: 14,
    utcMinute: 0,
    color: COLORS.light,
    labelBackgroundColor: COLORS.light,
    labelTextColor: 'white',
    lineStyle: 'solid',
    width: 1,
    showLabel: false,
  },
  {
    label: '11:30am',
    utcHour: 17,
    utcMinute: 30,
    color: COLORS.light,
    labelBackgroundColor: COLORS.light,
    labelTextColor: 'white',
    lineStyle: 'solid',
    width: 1,
    showLabel: false,
  },
  // AFTER US MARKET:
  {
    label: '6pm',
    utcHour: 0,
    utcMinute: 0,
    color: COLORS.light,
    labelBackgroundColor: COLORS.light,
    labelTextColor: 'white',
    lineStyle: 'solid',
    width: 1,
    showLabel: false,
  },
  {
    label: '7pm',
    utcHour: 1,
    utcMinute: 0,
    color: COLORS.light,
    labelBackgroundColor: COLORS.light,
    labelTextColor: 'white',
    lineStyle: 'solid',
    width: 1,
    showLabel: false,
  },
  // {
  //   label: '8pm',
  //   utcHour: 2,
  //   utcMinute: 0,
  //   color: COLORS.dark,
  //   labelBackgroundColor: COLORS.dark,
  //   labelTextColor: 'white',
  //   lineStyle: 'solid',
  //   width: 1,
  //   showLabel: false,
  // },
  {
    label: '8:30pm',
    utcHour: 2,
    utcMinute: 30,
    color: COLORS.light,
    labelBackgroundColor: COLORS.light,
    labelTextColor: 'white',
    lineStyle: 'solid',
    width: 1,
    showLabel: false,
  },
  {
    label: '11:45pm',
    utcHour: 5,
    utcMinute: 45,
    color: COLORS.light,
    labelBackgroundColor: COLORS.light,
    labelTextColor: 'white',
    lineStyle: 'solid',
    width: 1,
    showLabel: false,
  },
  {
    label: '3am',
    utcHour: 9,
    utcMinute: 0,
    color: COLORS.light,
    labelBackgroundColor: COLORS.light,
    labelTextColor: 'white',
    lineStyle: 'solid',
    width: 1,
    showLabel: false,
  },
]

// Time Ranges - shaded vertical areas on the chart
export const TIME_RANGE_HIGHLIGHTS: TimeRangeConfig[] = [
  {
    startUtcHour: 20, // 2:45pm
    startUtcMinute: 45,
    endUtcHour: 13, // 7:30am
    endUtcMinute: 30,
    color: COLORS.light_i,
  },
  {
    startUtcHour: 22, // 5pm
    startUtcMinute: 0,
    endUtcHour: 12, // 6am
    endUtcMinute: 0,
    color: COLORS.light_i,
  },
  {
    startUtcHour: 1, // 8pm
    startUtcMinute: 0,
    endUtcHour: 10, // 4:30am
    endUtcMinute: 30,
    color: COLORS.light_i,
  },
]
