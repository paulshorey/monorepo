/**
 * Direction Metrics: vd_ratio, cvd
 *
 * These metrics tell you WHO is aggressive - buyers or sellers.
 * They measure the directional pressure from market orders.
 */

/**
 * Calculate Volume Delta from ask and bid volumes
 *
 * VD = askVolume - bidVolume
 * - Positive VD = More aggressive buying (bullish pressure)
 * - Negative VD = More aggressive selling (bearish pressure)
 *
 * @param askVolume - Total volume traded at the ask (aggressive buys)
 * @param bidVolume - Total volume traded at the bid (aggressive sells)
 */
export function calculateVd(askVolume: number, bidVolume: number): number {
  return askVolume - bidVolume;
}

/**
 * Calculate VD Ratio (Delta Ratio)
 *
 * VD Ratio = VD / totalClassifiedVolume
 *
 * Normalized metric bounded between -1 and +1:
 * - +1 = 100% buy dominance (all volume at ask)
 * - -1 = 100% sell dominance (all volume at bid)
 * - 0 = balanced buying and selling
 *
 * This is the most important normalized metric for evaluating imbalance intensity.
 * Professional traders use this to distinguish between significant imbalances
 * (e.g., 65% delta) and noise-level readings (e.g., 8% delta).
 *
 * NOTE: Uses only classified volume (ask + bid), excluding unknown side trades.
 * This gives a more accurate picture of the known aggressor imbalance.
 * The unknownSideVolume is tracked separately in the candle but not included here.
 *
 * @param askVolume - Volume traded at the ask (aggressive buys)
 * @param bidVolume - Volume traded at the bid (aggressive sells)
 * @returns VD ratio bounded -1 to +1, or 0 if no classified volume
 */
export function calculateVdRatio(askVolume: number, bidVolume: number): number {
  const classifiedVolume = askVolume + bidVolume;
  if (classifiedVolume === 0) return 0;

  const vd = askVolume - bidVolume;
  return vd / classifiedVolume;
}
