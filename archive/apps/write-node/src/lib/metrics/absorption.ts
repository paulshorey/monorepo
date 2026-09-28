/**
 * Absorption Metrics: divergence
 *
 * Flags hidden accumulation/distribution by detecting when aggressive
 * volume doesn't move price as expected.
 */

/** Minimum thresholds for meaningful divergence detection */
const DIVERGENCE_MIN_PRICE_PCT = 0.5; // At least 0.5 basis points price move (0.005%)
const DIVERGENCE_MIN_VD_RATIO = 0.1; // At least 10% volume imbalance

/**
 * Detect delta-price divergence (accumulation/distribution signal)
 *
 * Divergence occurs when price and volume delta move in opposite directions,
 * indicating that aggressive orders are being absorbed by passive limit orders.
 *
 * - Bullish divergence (+1): Sellers aggressive (VD < 0) but price went UP
 *   → Passive buyers absorbing sell orders (ACCUMULATION)
 *   → Large traders building long positions without pushing price down
 *
 * - Bearish divergence (-1): Buyers aggressive (VD > 0) but price went DOWN
 *   → Passive sellers absorbing buy orders (DISTRIBUTION)
 *   → Large traders distributing positions despite buying pressure
 *
 * - No divergence (0): Price followed the aggressor direction (normal behavior)
 *
 * IMPROVED: Now requires minimum thresholds to filter noise:
 * - Price must move at least 0.5 basis points (0.005%)
 * - VD ratio must be at least 10% imbalance
 *
 * @param pricePct - Normalized price change (basis points)
 * @param vdRatio - VD ratio (-1 to +1)
 * @returns 1 for bullish, -1 for bearish, 0 for no divergence
 */
export function calculateDivergence(pricePct: number, vdRatio: number): -1 | 0 | 1 {
  // Require minimum thresholds to avoid noise
  const absPricePct = Math.abs(pricePct);
  const absVdRatio = Math.abs(vdRatio);

  // Not enough movement or imbalance to be meaningful
  if (absPricePct < DIVERGENCE_MIN_PRICE_PCT || absVdRatio < DIVERGENCE_MIN_VD_RATIO) {
    return 0;
  }

  // Bullish divergence: bearish VD (sellers aggressive) but price went up
  // This means sellers are being absorbed - accumulation zone
  if (vdRatio < 0 && pricePct > 0) return 1;

  // Bearish divergence: bullish VD (buyers aggressive) but price went down
  // This means buyers are being absorbed - distribution zone
  if (vdRatio > 0 && pricePct < 0) return -1;

  return 0;
}

// EVR (Effort vs Result) has been removed as a stored column.
// It can be derived at query time from price_pct and vd_ratio:
//   EVR = price_pct / (|vd_ratio| * 100)
// This avoids storing a column with numerical instability near zero.
