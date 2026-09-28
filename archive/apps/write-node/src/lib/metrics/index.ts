/**
 * Order Flow Metrics Library
 *
 * This library provides functions to calculate various order flow metrics
 * from TBBO (Trade with Best Bid/Offer) data.
 *
 * Metrics Categories:
 * 1. Direction: vd, vd_ratio, cvd - WHO is aggressive
 * 2. Confirmation: book_imbalance - passive support/resistance
 * 3. Institutional: big_trades, big_volume - weight the signal
 * 4. Absorption: divergence - hidden accumulation/distribution
 * 5. Price: price_pct - normalized price change
 */

// Direction metrics (vd, vd_ratio)
export { calculateVd, calculateVdRatio } from "./direction.js";

// Confirmation (book_imbalance)
export { calculateBookImbalance } from "./book-imbalance.js";

// Price metrics (price_pct)
export { calculatePricePct } from "./price.js";

// Absorption metrics (divergence)
export { calculateDivergence } from "./absorption.js";

// OHLC tracking for CVD
export type { MetricOHLC, MetricsOHLC } from "./ohlc.js";
export { initMetricOHLC, updateMetricOHLC, initCvdOHLC, updateCvdOHLC } from "./ohlc.js";
