/**
 * Live TBBO aggregator.
 *
 * The shared rolling-window engine owns the candle-building state. This class
 * only handles live-stream concerns: late-trade rejection, record
 * normalization, periodic flushes, and database persistence.
 */

import { pool } from "../lib/db.js";
import type { AggregatorStats, CandleForDb, NormalizedTrade, TbboRecord } from "../lib/trade/index.js";
import {
  MAX_TRADE_AGE_MS,
  RollingWindow1m,
  determineTradeSide,
  extractTicker,
  getMinuteBucket,
  getSecondBucket,
  nsToMs,
  writeCandles,
} from "../lib/trade/index.js";
import { Candles1h1mAggregator } from "./candles-1h-1m-aggregator.js";

export type { TbboRecord } from "../lib/trade/index.js";

const TARGET_TABLE = "candles_1m_1s";
const WRITE_BATCH_SIZE = 500;
const STATUS_LOG_INTERVAL_MS = 30_000;
const WINDOW_SECONDS = 60;

interface QueryResultLike<Row> {
  rows: Row[];
}

interface Queryable {
  query: <Row = unknown>(text: string, values?: unknown[]) => Promise<QueryResultLike<Row>>;
}

interface HourlyAggregatorLike {
  initialize(): Promise<void>;
  addBaseCandles(candles: CandleForDb[]): number;
  flushCompleted(): Promise<void>;
  flushAll(): Promise<void>;
}

interface Tbbo1mAggregatorOptions {
  queryable?: Queryable;
  writeCandlesFn?: typeof writeCandles;
  hourlyAggregator?: HourlyAggregatorLike;
}

export class Tbbo1mAggregator {
  private readonly queryable: Queryable;
  private readonly writeCandlesFn: typeof writeCandles;
  private readonly rollingWindow = new RollingWindow1m();
  private readonly hourlyAggregator: HourlyAggregatorLike;
  private initialized = false;
  private recordsProcessed = 0;
  private candlesWritten = 0;
  private lastLogTime = Date.now();
  private stats = {
    lateTradesRejected: 0,
    unknownSideTrades: 0,
  };

  constructor(options: Tbbo1mAggregatorOptions = {}) {
    this.queryable = options.queryable ?? pool;
    this.writeCandlesFn = options.writeCandlesFn ?? writeCandles;
    this.hourlyAggregator = options.hourlyAggregator ?? new Candles1h1mAggregator();
    console.log("📊 TBBO 1m aggregator created");
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn("⚠️ Aggregator already initialized");
      return;
    }

    try {
      const result = await this.queryable.query<{
        ticker: string;
        cvd: number | string | null;
      }>(`
        SELECT DISTINCT ON (ticker) ticker, cvd_close AS cvd
        FROM ${TARGET_TABLE}
        WHERE cvd_close IS NOT NULL
        ORDER BY ticker, time DESC
      `);

      for (const row of result.rows) {
        const cvd = Number(row.cvd) || 0;
        this.rollingWindow.seedTickerCvd(row.ticker, cvd);
        console.log(`📈 Loaded CVD for ${row.ticker}: ${cvd.toLocaleString()}`);
      }

      console.log(`✅ TBBO 1m aggregator initialized with CVD for ${result.rows.length} ticker(s)`);
    } catch (error) {
      console.warn("⚠️ Could not load CVD from database, starting fresh:", error);
    }

    await this.hourlyAggregator.initialize();

    this.initialized = true;
  }

  getStats(): AggregatorStats {
    const windowStats = this.rollingWindow.getStats();

    return {
      recordsProcessed: this.recordsProcessed,
      pendingCandles: windowStats.pendingCandles,
      candlesWritten: this.candlesWritten,
      lateTradesRejected: this.stats.lateTradesRejected,
      unknownSideTrades: this.stats.unknownSideTrades,
      syntheticSecondsFilled: windowStats.syntheticSecondsFilled,
      gapResets: windowStats.gapResets,
      outOfOrderTradesIgnored: windowStats.outOfOrderTradesIgnored,
      skippedNonFront: windowStats.skippedNonFront,
      activeContracts: windowStats.activeContracts,
      cvdByTicker: windowStats.cvdByTicker,
    };
  }

  getTickerSnapshots() {
    return this.rollingWindow.getTickerSnapshots();
  }

  addRecord(record: TbboRecord): boolean {
    if (this.isLateTrade(record)) {
      return false;
    }

    const { isAsk, isBid } = determineTradeSide(record.side, record.price, record.bidPrice, record.askPrice);
    if (!isAsk && !isBid) {
      this.stats.unknownSideTrades++;
      if (this.stats.unknownSideTrades <= 5 || this.stats.unknownSideTrades % 1000 === 0) {
        console.log(
          `📊 Unknown side trade #${this.stats.unknownSideTrades}: ` +
            `${record.symbol} @ ${record.price} (bid: ${record.bidPrice}, ask: ${record.askPrice})`,
        );
      }
    }

    const ticker = extractTicker(record.symbol);
    const trade: NormalizedTrade = {
      ticker,
      price: record.price,
      size: record.size,
      isAsk,
      isBid,
      symbol: record.symbol,
      bidPrice: record.bidPrice,
      askPrice: record.askPrice,
      bidSize: record.bidSize,
      askSize: record.askSize,
    };

    const accepted = this.rollingWindow.addTrade({
      trade,
      secondBucket: getSecondBucket(record.timestamp),
      minuteBucket: getMinuteBucket(record.timestamp),
    });

    if (!accepted) {
      return false;
    }

    this.recordsProcessed++;
    this.maybeLogStatus();
    return true;
  }

  async flushCompleted(): Promise<void> {
    this.rollingWindow.finalizeStaleSeconds();
    await this.flushPendingCandles("✅ Flushed", "⚠️ Dropped");
    await this.hourlyAggregator.flushCompleted();
  }

  async flushAll(): Promise<void> {
    this.rollingWindow.finalizeAll();
    await this.flushPendingCandles("🔄 Flushed", "⚠️ Dropped");
    await this.hourlyAggregator.flushAll();
  }

  private async flushPendingCandles(successPrefix: string, dropPrefix: string): Promise<void> {
    const pendingCandles = this.rollingWindow.drainPendingCandles();
    if (pendingCandles.length === 0) {
      return;
    }

    let totalWritten = 0;
    let totalDropped = 0;

    for (let i = 0; i < pendingCandles.length; i += WRITE_BATCH_SIZE) {
      const batch = pendingCandles.slice(i, i + WRITE_BATCH_SIZE);
      const success = await this.writeBatch(batch);
      if (success) {
        totalWritten += batch.length;
      } else {
        totalDropped += batch.length;
      }
    }

    if (totalWritten > 0) {
      console.log(`${successPrefix} ${totalWritten} rolling 1m candle(s) to ${TARGET_TABLE}`);
    }
    if (totalDropped > 0) {
      console.warn(`${dropPrefix} ${totalDropped} rolling 1m candle(s) due to DB write failures`);
    }
  }

  private isLateTrade(record: TbboRecord): boolean {
    const tradeTimeMs = nsToMs(record.timestamp);
    const ageMs = Date.now() - tradeTimeMs;

    if (ageMs <= MAX_TRADE_AGE_MS) {
      return false;
    }

    this.stats.lateTradesRejected++;
    if (this.stats.lateTradesRejected <= 5 || this.stats.lateTradesRejected % 100 === 0) {
      console.warn(
        `⚠️ Rejected late trade #${this.stats.lateTradesRejected}: ` +
          `${record.symbol} ${(ageMs / 1000).toFixed(1)}s old (max: ${MAX_TRADE_AGE_MS / 1000}s)`,
      );
    }
    return true;
  }

  private maybeLogStatus(): void {
    if (Date.now() - this.lastLogTime <= STATUS_LOG_INTERVAL_MS) {
      return;
    }

    const unknownPct =
      this.recordsProcessed > 0 ? ((this.stats.unknownSideTrades / this.recordsProcessed) * 100).toFixed(1) : "0";
    const snapshots = this.rollingWindow.getTickerSnapshots();
    const activeTickers = snapshots.filter((snapshot) => snapshot.warmupDone).map((snapshot) => `${snapshot.ticker}(${snapshot.ringSize}s)`);
    const warmupTickers = snapshots
      .filter((snapshot) => !snapshot.warmupDone)
      .map((snapshot) => `${snapshot.ticker}(${snapshot.warmupSecondsCollected}/${WINDOW_SECONDS})`);

    console.log(
      `📊 1m Aggregator: ${this.recordsProcessed.toLocaleString()} trades → ` +
        `${this.candlesWritten.toLocaleString()} candles written | ` +
        `Active: ${activeTickers.join(", ") || "none"} | ` +
        `Warmup: ${warmupTickers.join(", ") || "none"} | ` +
        `Unknown side: ${unknownPct}%, Late rejected: ${this.stats.lateTradesRejected}`,
    );
    this.lastLogTime = Date.now();
  }

  private async writeBatch(batch: CandleForDb[]): Promise<boolean> {
    if (batch.length === 0) {
      return true;
    }

    try {
      await this.writeCandlesFn(this.queryable, TARGET_TABLE, batch);
      this.candlesWritten += batch.length;
      this.hourlyAggregator.addBaseCandles(batch);
      await this.hourlyAggregator.flushCompleted();
      return true;
    } catch (error) {
      console.error("❌ Failed to write 1m candles:", error);
      return false;
    }
  }
}
