import { LineData, Time } from 'lightweight-charts'
import type { Candle } from '@/lib/market-data/candles'
import { RSI_PERIOD } from '../plot/constants'

export type IndicatorOutput = { time: Time; value: number }[]
export type IndicatorOHLCOutput = {
  time: Time
  open: number
  high: number
  low: number
  close: number
}[]

/**
 * Convert a value using power transformation for moderate compression
 * Exponent controls compression: 1.0 = linear, 0.5 = sqrt, lower = more compression
 * Returns 0 for values <= 0 to handle edge cases
 */
export function toLogScale(value: number, exponent: number = 0.5): number {
  if (value <= 0) return 0
  // return Math.log10(value)
  return Math.pow(value, exponent)
}

/**
 * Calculate RSI (Relative Strength Index) for a given period
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss over the period
 */
export function indicatorRSI(
  candles: Candle[],
  period: number = RSI_PERIOD,
  property: keyof Candle = 'close'
): IndicatorOutput {
  if (candles.length < period + 1) {
    return []
  }

  const result: IndicatorOutput = []

  // Calculate price changes
  const changes: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const current = candles[i]
    const previous = candles[i - 1]
    if (current && previous) {
      changes.push(current[property] - previous[property])
    }
  }

  // Calculate initial average gain and loss using SMA
  let avgGain = 0
  let avgLoss = 0

  for (let i = 0; i < period; i++) {
    const change = changes[i]
    if (change !== undefined) {
      if (change > 0) {
        avgGain += change
      } else {
        avgLoss += Math.abs(change)
      }
    }
  }

  avgGain /= period
  avgLoss /= period

  // First RSI value
  // Handle edge cases: flat market (no gains/losses) = 50, all gains = 100
  const firstRSI =
    avgGain === 0 && avgLoss === 0
      ? 50 // Neutral when no price movement
      : avgLoss === 0
        ? 100 // All gains, no losses = extreme overbought
        : 100 - 100 / (1 + avgGain / avgLoss)

  const firstCandle = candles[period]
  if (firstCandle) {
    result.push({
      time: (firstCandle.time / 1000) as Time,
      value: firstRSI,
    })
  }

  // Calculate subsequent RSI values using smoothed moving average (Wilder's smoothing)
  for (let i = period; i < changes.length; i++) {
    const change = changes[i]
    if (change === undefined) continue

    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0

    // Wilder's smoothing: avgGain = (prevAvgGain * (period - 1) + currentGain) / period
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    // Handle edge cases: flat market (no gains/losses) = 50, all gains = 100
    const rsi =
      avgGain === 0 && avgLoss === 0
        ? 50 // Neutral when no price movement
        : avgLoss === 0
          ? 100 // All gains, no losses = extreme overbought
          : 100 - 100 / (1 + avgGain / avgLoss)

    const candle = candles[i + 1]
    if (candle) {
      result.push({
        time: (candle.time / 1000) as Time,
        value: rsi,
      })
    }
  }

  return result
}

/**
 * Calculate RSI as OHLC bars by computing RSI independently for each price component.
 * Each bar's high/low are the max/min of all four RSI values to ensure valid OHLC structure.
 */
export function indicatorRSI_OHLC(
  candles: Candle[],
  period: number = RSI_PERIOD
): IndicatorOHLCOutput {
  const rsiOpen = indicatorRSI(candles, period, 'open')
  const rsiHigh = indicatorRSI(candles, period, 'high')
  const rsiLow = indicatorRSI(candles, period, 'low')
  const rsiClose = indicatorRSI(candles, period, 'close')

  const result: IndicatorOHLCOutput = []
  for (let i = 0; i < rsiClose.length; i++) {
    const o = rsiOpen[i]
    const h = rsiHigh[i]
    const l = rsiLow[i]
    const c = rsiClose[i]
    if (!o || !h || !l || !c) continue

    result.push({
      time: c.time,
      open: o.value,
      high: Math.max(o.value, h.value, l.value, c.value),
      low: Math.min(o.value, h.value, l.value, c.value),
      close: c.value,
    })
  }

  return result
}

/**
 * Calculate True Range for a single candle
 * TR = max(High - Low, |High - PreviousClose|, |Low - PreviousClose|)
 * Simplified: TR = max(High, PreviousClose) - min(Low, PreviousClose)
 *
 * True Range captures volatility including gaps from previous close.
 * Developed by J. Welles Wilder Jr.
 */
function _tr(current: Candle, previousClose: number | null): number {
  const highLow = current.high - current.low

  if (previousClose === null) {
    // First candle: just use high - low
    return highLow
  }

  const highPrevClose = Math.abs(current.high - previousClose)
  const lowPrevClose = Math.abs(current.low - previousClose)

  return Math.max(highLow, highPrevClose, lowPrevClose)
}

export function _trs(candles: Candle[]): number[] {
  // Calculate True Range for each candle
  const trValues: number[] = []
  for (let i = 0; i < candles.length; i++) {
    const current = candles[i]
    const previous = candles[i - 1]
    if (current) {
      const tr = _tr(current, previous?.close ?? null)
      trValues.push(tr)
    }
  }
  return trValues
}

export function indicatorTR(candles: Candle[]): LineData[] {
  // Calculate True Range for each candle
  const trValues: LineData[] = []
  for (let i = 0; i < candles.length; i++) {
    const current = candles[i]
    const previous = candles[i - 1]
    if (current) {
      const tr = _tr(current, previous?.close ?? null)
      trValues.push({
        time: (current.time / 1000) as Time,
        value: tr,
      })
    }
  }
  return trValues
}

/**
 * Calculate Exponential Moving Average for a series of values
 * EMA_t = (Value_t × α) + (EMA_(t-1) × (1 - α))
 * where α = 2 / (period + 1)
 *
 * First EMA value is initialized with Simple Moving Average of first N values.
 */
export function indicatorEMA(values: number[], period: number): number[] {
  if (values.length < period) {
    return []
  }

  const result: number[] = []
  const alpha = 2 / (period + 1)

  // Calculate initial SMA for the first EMA value
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += values[i] ?? 0
  }
  let ema = sum / period

  // First EMA value at index (period - 1)
  result.push(ema)

  // Calculate subsequent EMA values
  for (let i = period; i < values.length; i++) {
    const value = values[i] ?? 0
    ema = value * alpha + ema * (1 - alpha)
    result.push(ema)
  }

  return result
}

/**
 * Calculate Average True Range (ATR) using EMA smoothing
 * ATR is the exponential moving average of True Range values.
 *
 * @param candles - Array of candle data
 * @param period - EMA period (default 14, standard for ATR)
 * @returns Array of time/value pairs for charting
 */
export function indicatorATR(
  candles: Candle[],
  period: number = 14
): IndicatorOutput {
  if (candles.length < period + 1) {
    return []
  }

  // Calculate True Range for each candle
  const trValues = _trs(candles)

  // Apply EMA to True Range values
  const atrValues = indicatorEMA(trValues, period)

  // Map to output format (offset by period since EMA starts at index period-1)
  const result: IndicatorOutput = []
  for (let i = 0; i < atrValues.length; i++) {
    const candleIndex = i + period - 1
    const candle = candles[candleIndex]
    const atr = atrValues[i]
    if (candle && atr !== undefined) {
      result.push({
        time: (candle.time / 1000) as Time,
        value: atr,
      })
    }
  }

  return result
}

/**
 * Detects pivot points by scoring candles based on how often they represent
 * the highest high (+1) or lowest low (-1) within a sliding window.
 *
 * @param candles - Array of OHLCV candles sorted chronologically
 * @param windowSize - Number of candles to analyze (default: 10)
 * @param requireFullWindow - If true, only start scoring when we have a full window
 * @returns Array of { time, value } where value is the accumulated pivot score
 */
export function pivotPoints(
  candles: Candle[],
  windowSize: number = 10,
  requireFullWindow: boolean = false
): IndicatorOutput {
  if (!candles?.length) return []

  // Initialize scores for each candle
  const scores: number[] = new Array(candles.length).fill(0)

  // Determine starting index based on whether we require a full window
  const startIdx = requireFullWindow ? windowSize - 1 : 0

  // Iterate through each candle position (simulating "each new minute")
  for (let i = startIdx; i < candles.length; i++) {
    // Define window boundaries: last `windowSize` candles including current
    const windowStart = Math.max(0, i - windowSize + 1)

    // Find indices of candle with highest high and lowest low in window
    let maxHighIdx = windowStart
    let minLowIdx = windowStart

    for (let j = windowStart + 1; j <= i; j++) {
      const candleJ = candles[j]
      const candleMaxHigh = candles[maxHighIdx]
      const candleMinLow = candles[minLowIdx]
      if (!candleJ || !candleMaxHigh || !candleMinLow) continue

      // Use > to select the earliest candle in case of ties
      if (candleJ.high > candleMaxHigh.high) {
        maxHighIdx = j
      }
      if (candleJ.low < candleMinLow.low) {
        minLowIdx = j
      }
    }

    // Score the pivot candles
    const scoreHigh = scores[maxHighIdx]
    const scoreLow = scores[minLowIdx]
    if (scoreHigh !== undefined) scores[maxHighIdx] = scoreHigh + 1 // +1 for highest high
    if (scoreLow !== undefined) scores[minLowIdx] = scoreLow - 1 // -1 for lowest low
  }

  // Convert to output format
  return candles.map((candle, i) => ({
    time: (candle.time / 1000) as Time,
    value: !scores[i] || Math.abs(scores[i]) !== windowSize ? 0 : scores[i],
  }))
}
