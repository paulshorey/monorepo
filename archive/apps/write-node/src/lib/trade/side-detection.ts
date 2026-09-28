/**
 * Trade Side Detection (Lee-Ready Algorithm)
 *
 * Determines whether a trade was initiated by a buyer or seller
 * based on the trade price relative to the bid-ask spread.
 */

/**
 * Infer trade side using the Lee-Ready algorithm (1991)
 *
 * The algorithm classifies trades based on their position relative to the bid-ask midpoint:
 * - Price > midpoint = Buyer initiated (aggressive buy at ask)
 * - Price < midpoint = Seller initiated (aggressive sell at bid)
 * - Price = midpoint = Cannot determine
 *
 * @param price - Trade price
 * @param bidPrice - Best bid price at time of trade
 * @param askPrice - Best ask price at time of trade
 * @returns 'A' for ask (buy), 'B' for bid (sell), or null if undetermined
 */
export function inferSideFromPrice(
  price: number,
  bidPrice: number,
  askPrice: number
): "A" | "B" | null {
  // Need valid bid/ask to infer
  if (!bidPrice || !askPrice || bidPrice <= 0 || askPrice <= 0) {
    return null;
  }

  const midpoint = (bidPrice + askPrice) / 2;

  if (price > midpoint) {
    return "A"; // Trade closer to ask = aggressive buy
  } else if (price < midpoint) {
    return "B"; // Trade closer to bid = aggressive sell
  }

  // Price exactly at midpoint - cannot determine
  return null;
}

/**
 * Determine trade side from raw side value with Lee-Ready fallback
 *
 * @param side - Raw side value ('A', 'B', or other)
 * @param price - Trade price
 * @param bidPrice - Best bid price
 * @param askPrice - Best ask price
 * @returns Object with isAsk and isBid booleans
 */
export function determineTradeSide(
  side: string,
  price: number,
  bidPrice: number,
  askPrice: number
): { isAsk: boolean; isBid: boolean; wasInferred: boolean } {
  let isAsk = side === "A";
  let isBid = side === "B";
  let wasInferred = false;

  // If side unknown, try Lee-Ready algorithm
  if (!isAsk && !isBid) {
    const inferred = inferSideFromPrice(price, bidPrice, askPrice);
    if (inferred) {
      isAsk = inferred === "A";
      isBid = inferred === "B";
      wasInferred = true;
    }
  }

  return { isAsk, isBid, wasInferred };
}
