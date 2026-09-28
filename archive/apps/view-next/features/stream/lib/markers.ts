import { Candle } from '@/lib/market-data/candles'

/**
 * Detect absorption points where all conditions are met:
 * Returns timestamps of candles that meet all criteria
 * Used in usePlotData.ts
 * NOTE: THIS IS ONLY AN EXAMPLE - LOGIC IS WRONG, NEEDS TO BE REWRITTEN
 */
export function detectAbsorptionPoints(candles: Candle[]): number[] {
  const absorptionTimestamps: number[] = []

  for (const candle of candles) {
    const book_imbalance = candle.book_imbalance != null
    const big_volume = candle.big_volume > 0
    const big_trades = candle.big_trades > 0

    // Price movement divergence
    const hasPriceDivergence = Math.abs(candle.close - candle.open) > 0

    // All conditions are met:
    if (hasPriceDivergence && book_imbalance && big_trades && big_volume) {
      absorptionTimestamps.push(candle.time)
    }
  }

  return absorptionTimestamps
}
