import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Time, LineData } from 'lightweight-charts'
import { createURLStorage, getQueryParams } from './urlSync'
import { NEW_INTERVALS } from '@lib/db-trading/sql/strength/constants'

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================
export const strengthIntervalsAll = NEW_INTERVALS

/**
 * Filter out intervals that are too noisy or not useful for default display
 */
const getDefaultIntervals = (intervals: readonly string[]): string[] => {
  // const excludedIntervals = ['1', 'D', 'W']
  // return intervals.filter((i) => !excludedIntervals.includes(i))
  return ['3', '181']
}

/**
 * Market categories and their ticker options
 * This defines what tickers are available for selection
 */
export const tickersByMarket = [
  {
    market: '---equities---',
    tickers: [
      { label: 'All Indexes', value: ['NQ1!', 'ES1!', 'RTY1!'] },
      { label: 'NQ1!', value: ['NQ1!'] },
      { label: 'ES1!', value: ['ES1!'] },
      { label: 'RTY1!', value: ['RTY1!'] },
    ],
  },
  {
    market: '---metals---',
    tickers: [
      { label: 'Monetary', value: ['GC1!', 'SI1!'] },
      { label: 'Precious', value: ['GC1!', 'SI1!', 'PL1!'] },
      { label: 'GC1!', value: ['GC1!'] },
      { label: 'SI1!', value: ['SI1!'] },
      { label: 'PL1!', value: ['PL1!'] },
      { label: 'HG1!', value: ['HG1!'] },
    ],
  },
  {
    market: '---crypto---',
    tickers: [
      { label: 'BTC + SOL', value: ['BTCUSD', 'SOLUSD'] },
      { label: 'BTCUSD', value: ['BTCUSD'] },
      { label: 'SOLUSD', value: ['SOLUSD'] },
    ],
  },
]

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Individual interval strength data - keyed by interval string
 * Each interval (e.g., "30S", "1", "3") has its own line data
 */
export type StrengthIntervalsData = Record<string, LineData[] | null>

/**
 * Individual ticker price data - keyed by ticker symbol
 * Each ticker (e.g., "ES1!", "NQ1!") has its own line data
 */
export type PriceTickersData = Record<string, LineData[] | null>

/**
 * Store state for chart controls and data management
 * Simplified: Single chartTickers for both data fetching and display
 */
type State = {
  // Interval selection for strength data aggregation
  interval: string[]

  // Single ticker selection for both fetching and display
  chartTickers: string[]

  // Time and cursor states
  timeRange: { from: Time; to: Time } | null
  cursorTime: Time | null

  // Aggregated data for charts (averaged from intervals/tickers)
  strengthAverage: LineData[] | null
  priceAverage: LineData[] | null

  // Individual interval strength data (one line per interval)
  strengthIntervals: StrengthIntervalsData

  // Individual ticker price data (one line per ticker)
  priceTickers: PriceTickersData

  // Strength indicator (moving average of strengthAverage)
  strengthIndicator: LineData[] | null

  // Price indicator (moving average of priceAverage)
  priceIndicator: LineData[] | null

  // Toggle for showing aggregate average strength line (default: true)
  showStrengthLine: boolean

  // Toggle for showing strength indicator line (default: true)
  showStrengthIndicatorLine: boolean

  // Toggle for showing price indicator line (default: true)
  showPriceIndicatorLine: boolean

  // Toggle for showing individual interval strength lines (default: false)
  showStrengthIntervalLines: boolean

  // Toggle for showing aggregate average price line (default: true)
  showPriceLine: boolean

  // Toggle for showing individual ticker price lines (default: false)
  showPriceTickerLines: boolean

  // Hydration state for URL sync
  isHydrated: boolean
}

/**
 * Store actions for updating state
 * Simplified: Fewer setter methods needed
 */
type Actions = {
  // Configuration setters
  setInterval: (intervals: string[]) => void

  // Single ticker setter for all purposes
  setChartTickers: (tickers: string[]) => void

  // Time and cursor setters
  setTimeRange: (range: { from: Time; to: Time } | null) => void
  setCursorTime: (time: Time | null) => void

  // Data setters
  setStrengthAverage: (data: LineData[] | null) => void
  setPriceAverage: (data: LineData[] | null) => void
  setStrengthIntervals: (data: StrengthIntervalsData) => void
  setPriceTickers: (data: PriceTickersData) => void
  setStrengthIndicator: (data: LineData[] | null) => void
  setPriceIndicator: (data: LineData[] | null) => void

  // Display toggles
  setShowStrengthLine: (show: boolean) => void
  setshowStrengthIndicatorLine: (show: boolean) => void
  setShowPriceIndicatorLine: (show: boolean) => void
  setShowStrengthIntervalLines: (show: boolean) => void
  setShowPriceLine: (show: boolean) => void
  setShowPriceTickerLines: (show: boolean) => void

  // Utility actions
  resetToDefaults: () => void
  setIsHydrated: (hydrated: boolean) => void
}

export type ChartControlsStore = State & Actions

// ============================================================================
// URL SYNC CONFIGURATION
// ============================================================================

/**
 * Keys to sync with URL query parameters
 * Simplified URL structure
 */
const URL_SYNC_KEYS = ['interval', 'tickers']

// ============================================================================
// INITIALIZATION LOGIC
// ============================================================================

/**
 * Get initial state from URL parameters or defaults
 */
const getInitialState = (): State => {
  // Default to CX (Crypto Index) ticker
  const defaultTickers = tickersByMarket[0]!.tickers[2]!.value

  const defaultState: State = {
    interval: getDefaultIntervals(strengthIntervalsAll),
    chartTickers: defaultTickers,
    timeRange: null,
    cursorTime: null,
    strengthAverage: null,
    priceAverage: null,
    strengthIntervals: {},
    priceTickers: {},
    strengthIndicator: null,
    priceIndicator: null,
    showStrengthLine: false,
    showStrengthIntervalLines: true,
    showPriceLine: false,
    showPriceTickerLines: true,
    showStrengthIndicatorLine: false,
    showPriceIndicatorLine: false,
    isHydrated: false,
  }

  // Override with URL params if available
  if (typeof window !== 'undefined') {
    const urlParams = getQueryParams()

    if (urlParams.interval !== undefined) {
      defaultState.interval = urlParams.interval
    }

    if (urlParams.tickers !== undefined) {
      defaultState.chartTickers = urlParams.tickers
    }
  }

  return defaultState
}

// ============================================================================
// STORE CREATION
// ============================================================================

export const useChartControlsStore = create<ChartControlsStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      // Configuration setters
      setInterval: (intervals: string[]) => {
        // Ensure new array reference for React effect triggering
        set({ interval: [...intervals] })
      },

      // Single ticker setter
      setChartTickers: (tickers: string[]) => {
        set({ chartTickers: [...tickers] })
      },

      // Time and cursor setters
      setTimeRange: (range: { from: Time; to: Time } | null) => {
        set({ timeRange: range })
      },

      setCursorTime: (time: Time | null) => {
        set({ cursorTime: time })
      },

      // Data setters
      setStrengthAverage: (data: LineData[] | null) => {
        set({ strengthAverage: data })
      },

      setPriceAverage: (data: LineData[] | null) => {
        set({ priceAverage: data })
      },

      setStrengthIntervals: (data: StrengthIntervalsData) => {
        set({ strengthIntervals: { ...data } })
      },

      setPriceTickers: (data: PriceTickersData) => {
        set({ priceTickers: { ...data } })
      },

      setStrengthIndicator: (data: LineData[] | null) => {
        set({ strengthIndicator: data })
      },

      setPriceIndicator: (data: LineData[] | null) => {
        set({ priceIndicator: data })
      },

      // Display toggles
      setShowStrengthLine: (show: boolean) => {
        set({ showStrengthLine: show })
      },

      setshowStrengthIndicatorLine: (show: boolean) => {
        set({ showStrengthIndicatorLine: show })
      },

      setShowPriceIndicatorLine: (show: boolean) => {
        set({ showPriceIndicatorLine: show })
      },

      setShowStrengthIntervalLines: (show: boolean) => {
        set({ showStrengthIntervalLines: show })
      },

      setShowPriceLine: (show: boolean) => {
        set({ showPriceLine: show })
      },

      setShowPriceTickerLines: (show: boolean) => {
        set({ showPriceTickerLines: show })
      },

      // Utility actions
      resetToDefaults: () => {
        set(getInitialState())
      },

      setIsHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated })
      },
    }),
    {
      name: 'chart-controls',
      storage: createJSONStorage(() => createURLStorage(URL_SYNC_KEYS)),
      partialize: (state) => {
        // Direct mapping - no legacy names needed
        return {
          interval: state.interval,
          tickers: state.chartTickers,
        }
      },
      onRehydrateStorage: () => (state) => {
        state?.setIsHydrated(true)
      },
      skipHydration: false,
    }
  )
)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all unique tickers from the ticker market structure
 */
export const getAllTickers = (): string[] => {
  const allTickers = new Set<string>()
  tickersByMarket.forEach((market) => {
    market.tickers.forEach((ticker) => {
      ticker.value.forEach((t) => allTickers.add(t))
    })
  })
  return Array.from(allTickers)
}
