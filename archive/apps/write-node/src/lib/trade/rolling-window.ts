/**
 * Shared rolling-window aggregation for 1-minute candles at 1-second resolution.
 *
 * Both live streaming and historical ingest feed normalized trades into this
 * engine so they produce the same stitched front-month series, second-level
 * summaries, sparse-gap handling, warmup behavior, and trailing 60-second candles.
 */

import { createCandleFromTrade, updateCandleCvdOHLC, updateCandleWithTrade } from "./candle-aggregation.js";
import { FrontMonthTracker } from "./front-month.js";
import {
  collectOpenBucketTimesBetween,
  getConfiguredMarketSessionResolver,
  type MarketSessionResolver,
  type WeeklyMarketSession,
} from "./market-session.js";
import type { CandleForDb, CandleState, MetricCalculationContext, NormalizedTrade } from "./types.js";

interface SecondSummary {
  time: string;
  timeMs: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  askVolume: number;
  bidVolume: number;
  unknownSideVolume: number;
  sumBidDepth: number;
  sumAskDepth: number;
  sumSpread: number;
  sumMidPrice: number;
  sumPriceVolume: number;
  maxTradeSize: number;
  largeTradeCount: number;
  largeTradeVolume: number;
  tradeCount: number;
  symbol: string;
  cvdOpen: number;
  cvdHigh: number;
  cvdLow: number;
  cvdClose: number;
}

interface TickerRollingState {
  ring: SecondSummary[];
  currentCandle: CandleState | null;
  currentSecondBucket: string | null;
  runningCvd: number;
  secondStartCvd: number;
  warmupDone: boolean;
  warmupSecondsCollected: number;
  lastSummary: SecondSummary | null;
}

export interface TimedTradeInput {
  trade: NormalizedTrade;
  secondBucket: string;
  minuteBucket: string;
}

export interface RollingTickerSnapshot {
  ticker: string;
  ringSize: number;
  warmupDone: boolean;
  warmupSecondsCollected: number;
  runningCvd: number;
}

export interface RollingWindowStats {
  pendingCandles: number;
  secondsProcessed: number;
  candlesSkippedWarmup: number;
  syntheticSecondsFilled: number;
  gapResets: number;
  outOfOrderTradesIgnored: number;
  skippedNonFront: number;
  activeContracts: Record<string, string>;
  cvdByTicker: Record<string, number>;
}

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_MAX_SYNTHETIC_GAP_SECONDS = 5 * 60;

interface RollingWindow1mOptions {
  windowSeconds?: number;
  maxSyntheticGapSeconds?: number;
  tracker?: FrontMonthTracker;
  sessionCalendar?: WeeklyMarketSession;
  sessionCalendarResolver?: MarketSessionResolver;
}

export class RollingWindow1m {
  private readonly tickerStates = new Map<string, TickerRollingState>();
  private readonly tracker: FrontMonthTracker;
  private readonly windowSeconds: number;
  private readonly maxSyntheticGapSeconds: number;
  private readonly sessionCalendarResolver: MarketSessionResolver;

  private pendingCandles: CandleForDb[] = [];
  private secondsProcessed = 0;
  private candlesSkippedWarmup = 0;
  private syntheticSecondsFilled = 0;
  private gapResets = 0;
  private outOfOrderTradesIgnored = 0;

  constructor(options?: RollingWindow1mOptions) {
    this.windowSeconds = options?.windowSeconds ?? DEFAULT_WINDOW_SECONDS;
    this.maxSyntheticGapSeconds = options?.maxSyntheticGapSeconds ?? DEFAULT_MAX_SYNTHETIC_GAP_SECONDS;
    this.tracker = options?.tracker ?? new FrontMonthTracker();
    this.sessionCalendarResolver =
      options?.sessionCalendarResolver ??
      (options?.sessionCalendar ? () => options.sessionCalendar! : getConfiguredMarketSessionResolver());
  }

  seedTickerCvd(ticker: string, cvd: number): void {
    const state = this.getOrCreateTickerState(ticker);
    state.runningCvd = cvd;
    state.secondStartCvd = cvd;
  }

  addTrade({ trade, secondBucket, minuteBucket }: TimedTradeInput): boolean {
    const { ticker, symbol, size } = trade;
    const state = this.getOrCreateTickerState(ticker);
    const inputSecondMs = new Date(secondBucket).getTime();
    const crossedSecondBoundary = state.currentSecondBucket !== null && secondBucket !== state.currentSecondBucket;

    if (crossedSecondBoundary && state.currentSecondBucket) {
      const currentSecondMs = new Date(state.currentSecondBucket).getTime();
      if (inputSecondMs < currentSecondMs) {
        this.outOfOrderTradesIgnored++;
        return false;
      }
    } else if (!state.currentSecondBucket && state.lastSummary) {
      if (inputSecondMs <= state.lastSummary.timeMs) {
        this.outOfOrderTradesIgnored++;
        return false;
      }
    }

    if (!this.tracker.addTrade(symbol, ticker, minuteBucket, size)) {
      return false;
    }

    if (crossedSecondBoundary) {
      this.onSecondComplete(ticker, state);
      this.fillSyntheticGap(ticker, state, inputSecondMs);
    } else if (!state.currentSecondBucket && state.lastSummary) {
      this.fillSyntheticGap(ticker, state, inputSecondMs);
    }

    if (!state.currentSecondBucket) {
      state.currentSecondBucket = secondBucket;
      state.secondStartCvd = state.runningCvd;
    }

    if (!state.currentCandle) {
      state.currentCandle = createCandleFromTrade(trade);
    } else {
      updateCandleWithTrade(state.currentCandle, trade);
    }

    const context: MetricCalculationContext = { baseCvd: state.secondStartCvd };
    updateCandleCvdOHLC(state.currentCandle, context);
    return true;
  }

  finalizeStaleSeconds(currentTime: Date = new Date()): void {
    currentTime.setMilliseconds(0);
    const currentSecond = currentTime.toISOString();
    const currentSecondMs = currentTime.getTime();

    for (const [ticker, state] of this.tickerStates) {
      if (state.currentCandle && state.currentSecondBucket && state.currentSecondBucket < currentSecond) {
        this.onSecondComplete(ticker, state);
        this.fillSyntheticGap(ticker, state, currentSecondMs);
        continue;
      }

      if (!state.currentCandle && state.lastSummary && state.lastSummary.timeMs < currentSecondMs) {
        this.fillSyntheticGap(ticker, state, currentSecondMs);
      }
    }
  }

  finalizeAll(): void {
    for (const [ticker, state] of this.tickerStates) {
      if (state.currentCandle && state.currentSecondBucket) {
        this.onSecondComplete(ticker, state);
      }
    }
  }

  drainPendingCandles(): CandleForDb[] {
    if (this.pendingCandles.length === 0) {
      return [];
    }

    const drained = this.pendingCandles;
    this.pendingCandles = [];
    return drained;
  }

  getTickerSnapshots(): RollingTickerSnapshot[] {
    const snapshots: RollingTickerSnapshot[] = [];

    for (const [ticker, state] of this.tickerStates) {
      snapshots.push({
        ticker,
        ringSize: state.ring.length,
        warmupDone: state.warmupDone,
        warmupSecondsCollected: state.warmupSecondsCollected,
        runningCvd: state.runningCvd,
      });
    }

    snapshots.sort((a, b) => a.ticker.localeCompare(b.ticker));
    return snapshots;
  }

  getStats(): RollingWindowStats {
    const cvdByTicker: Record<string, number> = {};

    for (const [ticker, state] of this.tickerStates) {
      cvdByTicker[ticker] = state.runningCvd;
    }

    return {
      pendingCandles: this.pendingCandles.length,
      secondsProcessed: this.secondsProcessed,
      candlesSkippedWarmup: this.candlesSkippedWarmup,
      syntheticSecondsFilled: this.syntheticSecondsFilled,
      gapResets: this.gapResets,
      outOfOrderTradesIgnored: this.outOfOrderTradesIgnored,
      skippedNonFront: this.tracker.getSkippedCount(),
      activeContracts: Object.fromEntries(this.tracker.getActiveContracts()),
      cvdByTicker,
    };
  }

  getTotalVolumeBySymbol(): Map<string, number> {
    return this.tracker.getTotalVolumeBySymbol();
  }

  private getOrCreateTickerState(ticker: string): TickerRollingState {
    let state = this.tickerStates.get(ticker);
    if (!state) {
      state = {
        ring: [],
        currentCandle: null,
        currentSecondBucket: null,
        runningCvd: 0,
        secondStartCvd: 0,
        warmupDone: false,
        warmupSecondsCollected: 0,
        lastSummary: null,
      };
      this.tickerStates.set(ticker, state);
    }
    return state;
  }

  private createSecondSummary(time: string, candle: CandleState): SecondSummary {
    const cvdOhlc = candle.metricsOHLC?.cvd;

    return {
      time,
      timeMs: new Date(time).getTime(),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      askVolume: candle.askVolume,
      bidVolume: candle.bidVolume,
      unknownSideVolume: candle.unknownSideVolume,
      sumBidDepth: candle.sumBidDepth,
      sumAskDepth: candle.sumAskDepth,
      sumSpread: candle.sumSpread,
      sumMidPrice: candle.sumMidPrice,
      sumPriceVolume: candle.sumPriceVolume,
      maxTradeSize: candle.maxTradeSize,
      largeTradeCount: candle.largeTradeCount,
      largeTradeVolume: candle.largeTradeVolume,
      tradeCount: candle.tradeCount,
      symbol: candle.symbol,
      cvdOpen: cvdOhlc?.open ?? candle.currentCvd ?? 0,
      cvdHigh: cvdOhlc?.high ?? candle.currentCvd ?? 0,
      cvdLow: cvdOhlc?.low ?? candle.currentCvd ?? 0,
      cvdClose: candle.currentCvd ?? 0,
    };
  }

  private aggregateWindow(summaries: SecondSummary[]): CandleState {
    const first = summaries[0];
    const last = summaries[summaries.length - 1];

    let high = first.high;
    let low = first.low;
    let volume = 0;
    let askVolume = 0;
    let bidVolume = 0;
    let unknownSideVolume = 0;
    let sumBidDepth = 0;
    let sumAskDepth = 0;
    let sumSpread = 0;
    let sumMidPrice = 0;
    let sumPriceVolume = 0;
    let maxTradeSize = 0;
    let largeTradeCount = 0;
    let largeTradeVolume = 0;
    let tradeCount = 0;
    let cvdHigh = first.cvdHigh;
    let cvdLow = first.cvdLow;

    for (const summary of summaries) {
      high = Math.max(high, summary.high);
      low = Math.min(low, summary.low);
      volume += summary.volume;
      askVolume += summary.askVolume;
      bidVolume += summary.bidVolume;
      unknownSideVolume += summary.unknownSideVolume;
      sumBidDepth += summary.sumBidDepth;
      sumAskDepth += summary.sumAskDepth;
      sumSpread += summary.sumSpread;
      sumMidPrice += summary.sumMidPrice;
      sumPriceVolume += summary.sumPriceVolume;
      maxTradeSize = Math.max(maxTradeSize, summary.maxTradeSize);
      largeTradeCount += summary.largeTradeCount;
      largeTradeVolume += summary.largeTradeVolume;
      tradeCount += summary.tradeCount;
      cvdHigh = Math.max(cvdHigh, summary.cvdHigh);
      cvdLow = Math.min(cvdLow, summary.cvdLow);
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
      sumSpread,
      sumMidPrice,
      sumPriceVolume,
      maxTradeSize,
      largeTradeCount,
      largeTradeVolume,
      tradeCount,
      symbol: last.symbol,
      currentCvd: last.cvdClose,
      metricsOHLC: {
        cvd: {
          open: first.cvdOpen,
          high: cvdHigh,
          low: cvdLow,
          close: last.cvdClose,
        },
      },
    };
  }

  private onSecondComplete(ticker: string, state: TickerRollingState): void {
    if (!state.currentCandle || !state.currentSecondBucket) {
      return;
    }

    const summary = this.createSecondSummary(state.currentSecondBucket, state.currentCandle);
    this.processCompletedSummary(ticker, state, summary);
    state.currentCandle = null;
    state.currentSecondBucket = null;
  }

  private fillSyntheticGap(ticker: string, state: TickerRollingState, targetSecondMsExclusive: number): void {
    if (!state.lastSummary) {
      return;
    }

    const firstMissingSecondMs = state.lastSummary.timeMs + 1000;
    if (firstMissingSecondMs >= targetSecondMsExclusive) {
      return;
    }

    const openGap = collectOpenBucketTimesBetween(
      firstMissingSecondMs,
      targetSecondMsExclusive,
      1000,
      this.maxSyntheticGapSeconds,
      this.sessionCalendarResolver(ticker),
    );
    if (openGap.exceeded) {
      this.resetTickerGapState(ticker, state, openGap.openBucketCount);
      return;
    }

    for (const timeMs of openGap.bucketTimes) {
      const summary = this.createSyntheticSecondSummary(state.lastSummary, timeMs);
      this.syntheticSecondsFilled++;
      this.processCompletedSummary(ticker, state, summary);
    }
  }

  private createSyntheticSecondSummary(previous: SecondSummary, timeMs: number): SecondSummary {
    const carriedPrice = previous.close;
    const carriedCvd = previous.cvdClose;

    return {
      time: new Date(timeMs).toISOString(),
      timeMs,
      open: carriedPrice,
      high: carriedPrice,
      low: carriedPrice,
      close: carriedPrice,
      volume: 0,
      askVolume: 0,
      bidVolume: 0,
      unknownSideVolume: 0,
      sumBidDepth: 0,
      sumAskDepth: 0,
      sumSpread: 0,
      sumMidPrice: 0,
      sumPriceVolume: 0,
      maxTradeSize: 0,
      largeTradeCount: 0,
      largeTradeVolume: 0,
      tradeCount: 0,
      symbol: previous.symbol,
      cvdOpen: carriedCvd,
      cvdHigh: carriedCvd,
      cvdLow: carriedCvd,
      cvdClose: carriedCvd,
    };
  }

  private processCompletedSummary(ticker: string, state: TickerRollingState, summary: SecondSummary): void {
    state.runningCvd = summary.cvdClose;
    state.lastSummary = summary;
    state.ring.push(summary);
    this.secondsProcessed++;
    state.warmupSecondsCollected++;

    while (state.ring.length > this.windowSeconds) {
      state.ring.shift();
    }

    if (state.ring.length === 0) {
      state.warmupDone = false;
      state.warmupSecondsCollected = 0;
      this.candlesSkippedWarmup++;
      return;
    }

    if (!state.warmupDone) {
      if (state.warmupSecondsCollected < this.windowSeconds) {
        this.candlesSkippedWarmup++;
        return;
      }

      state.warmupDone = true;
      console.log(`🔥 Warmup complete for ${ticker} at ${summary.time} (${state.ring.length} seconds in buffer)`);
    }

    const candle = this.aggregateWindow(state.ring);
    this.pendingCandles.push({
      key: `${ticker}|${summary.time}`,
      ticker,
      time: summary.time,
      candle,
    });
  }

  private resetTickerGapState(ticker: string, state: TickerRollingState, missingOpenSeconds: number): void {
    state.ring = [];
    state.currentCandle = null;
    state.currentSecondBucket = null;
    state.warmupDone = false;
    state.warmupSecondsCollected = 0;
    state.lastSummary = null;
    this.gapResets++;
    console.log(
      `⏭️ Reset rolling 1m state for ${ticker} after ${missingOpenSeconds}s open-market gap ` +
        `(max synthetic fill ${this.maxSyntheticGapSeconds}s)`,
    );
  }
}
