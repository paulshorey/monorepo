/**
 * Front-Month Contract Tracker
 *
 * Determines which individual contract (e.g., ESH5 vs ESM5) is the active
 * front-month for a given ticker (ES) using a rolling volume window.
 *
 * The active contract is re-evaluated at each minute boundary by summing
 * volume per symbol over the last N minutes. This:
 * - Detects real rolls within 1-5 minutes (new contract's volume overtakes old)
 * - Ignores momentary quiet periods (a single quiet second can't flip)
 * - Works identically for batch and live (uses data timestamps, not wall-clock)
 * - Has bounded memory (cleaned up automatically)
 *
 * Used by batch ingest (tbbo-1m-1s) and the live Tbbo1mAggregator.
 */

import { extractTicker } from "./symbol.js";

/** Default rolling window size in minutes */
const DEFAULT_WINDOW_MINUTES = 5;

export class FrontMonthTracker {
  /** Rolling window size in minutes */
  private readonly windowMinutes: number;

  /** Volume per symbol per minute bucket: "ESH5|2025-01-01T00:00:00.000Z" -> volume */
  private readonly recentVolume: Map<string, number> = new Map();

  /** Current active (front-month) contract per ticker: "ES" -> "ESH5" */
  private readonly activeContract: Map<string, string> = new Map();

  /** Last minute bucket we evaluated at, per ticker */
  private readonly lastEvalMinute: Map<string, string> = new Map();

  /** All-time cumulative volume per symbol (for diagnostics/summary) */
  private readonly totalVolume: Map<string, number> = new Map();

  /** Count of trades skipped because they were from a non-active contract */
  private skippedCount = 0;

  constructor(windowMinutes: number = DEFAULT_WINDOW_MINUTES) {
    this.windowMinutes = windowMinutes;
  }

  /**
   * Record a trade's volume and determine if it should be aggregated.
   *
   * Returns true if the trade is from the active (front-month) contract
   * and should be processed into a candle. Returns false if it should be
   * skipped (non-front-month contract).
   *
   * @param symbol - Individual contract symbol (e.g., "ESH5")
   * @param ticker - Parent ticker (e.g., "ES")
   * @param minuteBucket - Minute-resolution timestamp for the trade (ISO string)
   * @param size - Trade size (volume)
   * @returns true if trade should be aggregated, false to skip
   */
  addTrade(symbol: string, ticker: string, minuteBucket: string, size: number): boolean {
    // Always track volume (rolling window + total)
    const windowKey = `${symbol}|${minuteBucket}`;
    this.recentVolume.set(windowKey, (this.recentVolume.get(windowKey) || 0) + size);
    this.totalVolume.set(symbol, (this.totalVolume.get(symbol) || 0) + size);

    // First trade ever for this ticker - set active immediately
    if (!this.activeContract.has(ticker)) {
      this.activeContract.set(ticker, symbol);
      this.lastEvalMinute.set(ticker, minuteBucket);
      console.log(`   🔗 ${ticker}: active contract set to ${symbol}`);
      return true;
    }

    // Re-evaluate at minute boundaries
    const lastMinute = this.lastEvalMinute.get(ticker);
    if (lastMinute !== minuteBucket) {
      this.evaluate(ticker, minuteBucket);
      this.lastEvalMinute.set(ticker, minuteBucket);
    }

    // Accept or reject based on active contract
    if (symbol === this.activeContract.get(ticker)) {
      return true;
    }

    this.skippedCount++;
    return false;
  }

  /**
   * Re-evaluate which contract is the front-month for a ticker.
   * Sums volume per symbol over the rolling window and picks the winner.
   * Also cleans up entries older than the window.
   */
  private evaluate(ticker: string, currentMinute: string): void {
    const cutoffMs = new Date(currentMinute).getTime() - this.windowMinutes * 60_000;

    // Sum volume per symbol within the window, clean up old entries
    const symbolVolume: Map<string, number> = new Map();
    for (const [key, vol] of this.recentVolume) {
      const pipeIdx = key.lastIndexOf("|");
      const sym = key.slice(0, pipeIdx);
      const minute = key.slice(pipeIdx + 1);
      const minuteMs = new Date(minute).getTime();

      // Clean up entries older than the window
      if (minuteMs < cutoffMs) {
        this.recentVolume.delete(key);
        continue;
      }

      // Only consider symbols belonging to this ticker
      if (extractTicker(sym) === ticker) {
        symbolVolume.set(sym, (symbolVolume.get(sym) || 0) + vol);
      }
    }

    // Find the symbol with the most volume in the window
    let bestSymbol: string | undefined;
    let bestVolume = 0;
    for (const [sym, vol] of symbolVolume) {
      if (vol > bestVolume) {
        bestSymbol = sym;
        bestVolume = vol;
      }
    }

    // Switch active contract if a different symbol now dominates
    const currentActive = this.activeContract.get(ticker);
    if (bestSymbol && bestSymbol !== currentActive) {
      const oldVolume = currentActive ? (symbolVolume.get(currentActive) || 0) : 0;
      this.activeContract.set(ticker, bestSymbol);
      console.log(
        `   🔄 ${ticker}: rolled from ${currentActive} to ${bestSymbol} ` +
          `(${this.windowMinutes}min vol: ${bestVolume.toLocaleString()} vs ${oldVolume.toLocaleString()})`,
      );
    }
  }

  // ===========================================================================
  // Accessors (for summary/diagnostics)
  // ===========================================================================

  /** Get the current active contract for a ticker */
  getActiveContract(ticker: string): string | undefined {
    return this.activeContract.get(ticker);
  }

  /** Get all active contracts (ticker -> symbol) */
  getActiveContracts(): Map<string, string> {
    return new Map(this.activeContract);
  }

  /** Get all-time cumulative volume per symbol (for summary output) */
  getTotalVolumeBySymbol(): Map<string, number> {
    return new Map(this.totalVolume);
  }

  /** Get number of trades skipped because they were from a non-active contract */
  getSkippedCount(): number {
    return this.skippedCount;
  }
}
