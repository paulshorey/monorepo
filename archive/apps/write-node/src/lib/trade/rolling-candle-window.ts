/**
 * Shared rolling-window aggregation for higher-timeframe candles derived from
 * already-finalized lower-timeframe candle rows.
 */

import {
  collectOpenBucketTimesBetween,
  getConfiguredMarketSessionResolver,
  type MarketSessionResolver,
  type WeeklyMarketSession,
} from "./market-session.js";
import type { CandleForDb, CandleState } from "./types.js";

interface TickerWindowState {
  ring: CandleForDb[];
  warmupDone: boolean;
  lastInputTime: string | null;
  lastInputMs: number | null;
}

export interface RollingCandleWindowStats {
  pendingCandles: number;
  candlesSkippedWarmup: number;
  gapResets: number;
  duplicateInputsIgnored: number;
  outOfOrderInputsIgnored: number;
}

export interface RollingCandleTickerSnapshot {
  ticker: string;
  ringSize: number;
  warmupDone: boolean;
  lastInputTime: string | null;
}

interface RollingCandleWindowOptions {
  windowSize: number;
  expectedIntervalMs: number;
  label: string;
  sessionCalendar?: WeeklyMarketSession;
  sessionCalendarResolver?: MarketSessionResolver;
}

export class RollingCandleWindow {
  private readonly tickerStates = new Map<string, TickerWindowState>();
  private readonly windowSize: number;
  private readonly expectedIntervalMs: number;
  private readonly label: string;
  private readonly sessionCalendarResolver: MarketSessionResolver;

  private pendingCandles: CandleForDb[] = [];
  private stats = {
    candlesSkippedWarmup: 0,
    gapResets: 0,
    duplicateInputsIgnored: 0,
    outOfOrderInputsIgnored: 0,
  };

  constructor(options: RollingCandleWindowOptions) {
    this.windowSize = options.windowSize;
    this.expectedIntervalMs = options.expectedIntervalMs;
    this.label = options.label;
    this.sessionCalendarResolver =
      options.sessionCalendarResolver ??
      (options.sessionCalendar ? () => options.sessionCalendar! : getConfiguredMarketSessionResolver());
  }

  seedCandles(candles: CandleForDb[]): void {
    const sorted = [...candles].sort((a, b) => {
      if (a.ticker !== b.ticker) {
        return a.ticker.localeCompare(b.ticker);
      }
      return a.time.localeCompare(b.time);
    });

    for (const candle of sorted) {
      this.ingestCandle(candle, false);
    }
  }

  addCandles(candles: CandleForDb[]): number {
    const sorted = [...candles].sort((a, b) => {
      if (a.ticker !== b.ticker) {
        return a.ticker.localeCompare(b.ticker);
      }
      return a.time.localeCompare(b.time);
    });

    let accepted = 0;
    for (const candle of sorted) {
      if (this.ingestCandle(candle, true)) {
        accepted++;
      }
    }

    return accepted;
  }

  drainPendingCandles(): CandleForDb[] {
    if (this.pendingCandles.length === 0) {
      return [];
    }

    const drained = this.pendingCandles;
    this.pendingCandles = [];
    return drained;
  }

  requeuePendingCandles(candles: CandleForDb[]): void {
    if (candles.length === 0) {
      return;
    }

    const sorted = [...candles].sort((a, b) => {
      if (a.ticker !== b.ticker) {
        return a.ticker.localeCompare(b.ticker);
      }
      return a.time.localeCompare(b.time);
    });

    this.pendingCandles = [...sorted, ...this.pendingCandles];
  }

  getStats(): RollingCandleWindowStats {
    return {
      pendingCandles: this.pendingCandles.length,
      candlesSkippedWarmup: this.stats.candlesSkippedWarmup,
      gapResets: this.stats.gapResets,
      duplicateInputsIgnored: this.stats.duplicateInputsIgnored,
      outOfOrderInputsIgnored: this.stats.outOfOrderInputsIgnored,
    };
  }

  getTickerSnapshots(): RollingCandleTickerSnapshot[] {
    const snapshots: RollingCandleTickerSnapshot[] = [];

    for (const [ticker, state] of this.tickerStates) {
      snapshots.push({
        ticker,
        ringSize: state.ring.length,
        warmupDone: state.warmupDone,
        lastInputTime: state.lastInputTime,
      });
    }

    return snapshots.sort((a, b) => a.ticker.localeCompare(b.ticker));
  }

  private ingestCandle(input: CandleForDb, emitOutput: boolean): boolean {
    const state = this.getOrCreateTickerState(input.ticker);
    const inputTimeMs = new Date(input.time).getTime();

    if (state.lastInputMs !== null) {
      const deltaMs = inputTimeMs - state.lastInputMs;

      if (deltaMs === 0) {
        this.stats.duplicateInputsIgnored++;
        return false;
      }

      if (deltaMs < 0) {
        this.stats.outOfOrderInputsIgnored++;
        return false;
      }

      if (deltaMs > this.expectedIntervalMs) {
        const firstMissingInputMs = state.lastInputMs + this.expectedIntervalMs;
        const openGap = collectOpenBucketTimesBetween(
          firstMissingInputMs,
          inputTimeMs,
          this.expectedIntervalMs,
          0,
          this.sessionCalendarResolver(input.ticker),
        );
        if (openGap.exceeded) {
          state.ring = [];
          state.warmupDone = false;
          this.stats.gapResets++;
        }
      }
    }

    state.lastInputTime = input.time;
    state.lastInputMs = inputTimeMs;
    state.ring.push(input);

    while (state.ring.length > this.windowSize) {
      state.ring.shift();
    }

    if (state.ring.length < this.windowSize) {
      this.stats.candlesSkippedWarmup++;
      return true;
    }

    if (!state.warmupDone) {
      state.warmupDone = true;
      console.log(`🔥 ${this.label} warmup complete for ${input.ticker} at ${input.time}`);
    }

    if (emitOutput) {
      const candle = this.aggregateWindow(state.ring);
      this.pendingCandles.push({
        key: `${input.ticker}|${input.time}`,
        ticker: input.ticker,
        time: input.time,
        candle,
      });
    }

    return true;
  }

  private aggregateWindow(inputs: CandleForDb[]): CandleState {
    const first = inputs[0].candle;
    const last = inputs[inputs.length - 1].candle;

    let high = first.high;
    let low = first.low;
    let volume = 0;
    let askVolume = 0;
    let bidVolume = 0;
    let unknownSideVolume = 0;
    let sumBidDepth = 0;
    let sumAskDepth = 0;
    let sumPriceVolume = 0;
    let maxTradeSize = 0;
    let largeTradeCount = 0;
    let largeTradeVolume = 0;
    let tradeCount = 0;
    let cvdHigh = first.metricsOHLC?.cvd.high ?? first.currentCvd ?? 0;
    let cvdLow = first.metricsOHLC?.cvd.low ?? first.currentCvd ?? 0;

    for (const input of inputs) {
      const candle = input.candle;
      high = Math.max(high, candle.high);
      low = Math.min(low, candle.low);
      volume += candle.volume;
      askVolume += candle.askVolume;
      bidVolume += candle.bidVolume;
      unknownSideVolume += candle.unknownSideVolume;
      sumBidDepth += candle.sumBidDepth;
      sumAskDepth += candle.sumAskDepth;
      sumPriceVolume += candle.sumPriceVolume;
      maxTradeSize = Math.max(maxTradeSize, candle.maxTradeSize);
      largeTradeCount += candle.largeTradeCount;
      largeTradeVolume += candle.largeTradeVolume;
      tradeCount += candle.tradeCount;
      cvdHigh = Math.max(cvdHigh, candle.metricsOHLC?.cvd.high ?? candle.currentCvd ?? cvdHigh);
      cvdLow = Math.min(cvdLow, candle.metricsOHLC?.cvd.low ?? candle.currentCvd ?? cvdLow);
    }

    return {
      open: first.open,
      high,
      low,
      close: last.close,
      volume,
      askVolume,
      bidVolume,
      unknownSideVolume,
      sumBidDepth,
      sumAskDepth,
      sumSpread: 0,
      sumMidPrice: 0,
      sumPriceVolume,
      maxTradeSize,
      largeTradeCount,
      largeTradeVolume,
      tradeCount,
      symbol: last.symbol,
      currentCvd: last.currentCvd,
      metricsOHLC:
        first.metricsOHLC && last.metricsOHLC
          ? {
              cvd: {
                open: first.metricsOHLC.cvd.open,
                high: cvdHigh,
                low: cvdLow,
                close: last.metricsOHLC.cvd.close,
              },
            }
          : undefined,
    };
  }

  private getOrCreateTickerState(ticker: string): TickerWindowState {
    let state = this.tickerStates.get(ticker);

    if (!state) {
      state = {
        ring: [],
        warmupDone: false,
        lastInputTime: null,
        lastInputMs: null,
      };
      this.tickerStates.set(ticker, state);
    }

    return state;
  }
}
