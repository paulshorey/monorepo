/**
 * Book Imbalance (Confirmation)
 *
 * Shows passive support/resistance from limit orders waiting in the book.
 * This is fundamentally different from VD which measures AGGRESSIVE order flow.
 */

/**
 * Calculate Book Imbalance (Order Book Imbalance / OBI)
 *
 * Book Imbalance = (sumBidDepth - sumAskDepth) / (sumBidDepth + sumAskDepth)
 *
 * Measures the PASSIVE order imbalance - limit orders waiting in the book.
 *
 * Bounded between -1 and +1:
 * - +1.0 = All passive depth is on bid side (strong support below)
 * - -1.0 = All passive depth is on ask side (strong resistance above)
 * - 0.0 = Balanced passive liquidity
 *
 * Trading signals:
 * - Positive book_imbalance = More passive buyers waiting → support
 * - Negative book_imbalance = More passive sellers waiting → resistance
 *
 * Combined with VD:
 * - VD positive + book_imbalance positive = Strong bullish (aggressive buying into support)
 * - VD negative + book_imbalance negative = Strong bearish (aggressive selling into resistance)
 * - VD positive + book_imbalance negative = Potential exhaustion (buying into resistance)
 * - VD negative + book_imbalance positive = Potential reversal (selling into support)
 *
 * @param sumBidDepth - Sum of bidSize across all trades in candle
 * @param sumAskDepth - Sum of askSize across all trades in candle
 * @returns Book imbalance bounded -1 to +1, or 0 if no depth data
 */
export function calculateBookImbalance(sumBidDepth: number, sumAskDepth: number): number {
  const totalDepth = sumBidDepth + sumAskDepth;
  if (totalDepth === 0) return 0;

  return (sumBidDepth - sumAskDepth) / totalDepth;
}
