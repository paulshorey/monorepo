/**
 * Timestamp Utilities
 *
 * Functions for handling nanosecond timestamps and minute bucket calculations.
 */

/** Maximum age (in ms) for a trade to be accepted. Trades older than this are rejected. */
export const MAX_TRADE_AGE_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Convert nanosecond timestamp string to milliseconds
 * @param nsTimestamp - Nanosecond epoch timestamp as string (e.g., "1768275460711927889")
 */
export function nsToMs(nsTimestamp: string): number {
  return Math.floor(parseInt(nsTimestamp, 10) / 1_000_000);
}

/**
 * Get the start of the 1-minute bucket for a nanosecond timestamp
 * @param nsTimestamp - Nanosecond epoch timestamp as string
 * @returns ISO string for the start of the minute (e.g., "2024-01-15T14:30:00.000Z")
 */
export function getMinuteBucket(nsTimestamp: string): string {
  const msTimestamp = nsToMs(nsTimestamp);
  const date = new Date(msTimestamp);
  date.setSeconds(0, 0);
  return date.toISOString();
}

/**
 * Parse any timestamp format to minute bucket
 * Supports:
 * - ISO string: "2025-12-01T00:00:00.003176304Z"
 * - Nanosecond epoch string: "1768275460711927889"
 * - Nanosecond epoch number: 1768275460711927889
 *
 * @param timestamp - Timestamp in any supported format
 * @returns ISO string for the start of the minute
 */
export function toMinuteBucket(timestamp: string | number): string {
  let date: Date;

  if (typeof timestamp === "number") {
    // Nanosecond epoch number - convert to milliseconds
    date = new Date(Math.floor(timestamp / 1_000_000));
  } else if (timestamp.includes("T") || timestamp.includes("-")) {
    // ISO string format
    date = new Date(timestamp);
  } else {
    // Nanosecond epoch string - convert to milliseconds
    date = new Date(Math.floor(parseInt(timestamp, 10) / 1_000_000));
  }

  date.setSeconds(0, 0);
  return date.toISOString();
}

/**
 * Parse any timestamp format to second bucket.
 *
 * Supports ISO timestamps and nanosecond epoch values.
 */
export function toSecondBucket(timestamp: string | number): string {
  let date: Date;

  if (typeof timestamp === "number") {
    date = new Date(Math.floor(timestamp / 1_000_000));
  } else if (timestamp.includes("T") || timestamp.includes("-")) {
    date = new Date(timestamp);
  } else {
    date = new Date(Math.floor(parseInt(timestamp, 10) / 1_000_000));
  }

  date.setMilliseconds(0);
  return date.toISOString();
}

/**
 * Get the start of the 1-second bucket for a nanosecond timestamp
 * @param nsTimestamp - Nanosecond epoch timestamp as string
 * @returns ISO string for the start of the second (e.g., "2024-01-15T14:30:05.000Z")
 */
export function getSecondBucket(nsTimestamp: string): string {
  return toSecondBucket(nsTimestamp);
}

/**
 * Check whether an ISO timestamp lands exactly on a minute boundary.
 */
export function isMinuteBoundary(timestamp: string): boolean {
  const date = new Date(timestamp);
  return date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;
}

/**
 * Check whether an ISO timestamp lands exactly on an hour boundary.
 *
 * Used by the daily rolling aggregator to filter the minute-cadence
 * `candles_1h_1m` stream down to its hour-boundary subset.
 */
export function isHourBoundary(timestamp: string): boolean {
  const date = new Date(timestamp);
  return (
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

/**
 * Check if a trade timestamp is too old to process
 *
 * @param nsTimestamp - Trade timestamp in nanoseconds
 * @returns Object with isLate flag and age in milliseconds
 */
export function checkTradeAge(nsTimestamp: string): { isLate: boolean; ageMs: number } {
  const tradeTimeMs = nsToMs(nsTimestamp);
  const ageMs = Date.now() - tradeTimeMs;
  return {
    isLate: ageMs > MAX_TRADE_AGE_MS,
    ageMs,
  };
}
