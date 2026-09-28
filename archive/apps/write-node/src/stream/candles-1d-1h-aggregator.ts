/**
 * Live aggregator for canonical rolling `candles_1d_1h`.
 *
 * Each row is a trailing 24-hour rolling window for a ticker, derived from the
 * hour-boundary subset of canonical `candles_1h_1m` rows. The cadence of new
 * rows is one per hour.
 *
 * Mirrors the structure of `Candles1h1mAggregator`: hydrate from the canonical
 * source table on startup, reconcile any source rows newer than the latest
 * target row, then accept hour-boundary inputs forwarded by the upstream
 * aggregator at runtime.
 */

import { pool } from "../lib/db.js";
import type { CandleForDb, StoredCandleRow } from "../lib/trade/index.js";
import { RollingCandleWindow, candleForDbFromStoredRow, isHourBoundary, writeCandles } from "../lib/trade/index.js";

const SOURCE_TABLE = "candles_1h_1m";
const TARGET_TABLE = "candles_1d_1h";
const HYDRATION_WINDOW_ROWS = 24;
const WINDOW_HOURS = 24;
const WRITE_BATCH_SIZE = 200;
const HYDRATION_RETRY_LOG_INTERVAL_MS = 30_000;
const RECONCILIATION_PAGE_SIZE = 5_000;
const RECONCILIATION_FLUSH_THRESHOLD = 5_000;

const SOURCE_COLUMNS = `
  time,
  ticker,
  symbol,
  open,
  high,
  low,
  close,
  volume,
  ask_volume,
  bid_volume,
  cvd_open,
  cvd_high,
  cvd_low,
  cvd_close,
  trades,
  max_trade_size,
  big_trades,
  big_volume,
  vd,
  vd_ratio,
  book_imbalance,
  price_pct,
  divergence,
  sum_bid_depth,
  sum_ask_depth,
  sum_price_volume,
  unknown_volume
`;

const SOURCE_COLUMNS_FROM_SOURCE_TABLE = `
  ${SOURCE_TABLE}.time,
  ${SOURCE_TABLE}.ticker,
  ${SOURCE_TABLE}.symbol,
  ${SOURCE_TABLE}.open,
  ${SOURCE_TABLE}.high,
  ${SOURCE_TABLE}.low,
  ${SOURCE_TABLE}.close,
  ${SOURCE_TABLE}.volume,
  ${SOURCE_TABLE}.ask_volume,
  ${SOURCE_TABLE}.bid_volume,
  ${SOURCE_TABLE}.cvd_open,
  ${SOURCE_TABLE}.cvd_high,
  ${SOURCE_TABLE}.cvd_low,
  ${SOURCE_TABLE}.cvd_close,
  ${SOURCE_TABLE}.trades,
  ${SOURCE_TABLE}.max_trade_size,
  ${SOURCE_TABLE}.big_trades,
  ${SOURCE_TABLE}.big_volume,
  ${SOURCE_TABLE}.vd,
  ${SOURCE_TABLE}.vd_ratio,
  ${SOURCE_TABLE}.book_imbalance,
  ${SOURCE_TABLE}.price_pct,
  ${SOURCE_TABLE}.divergence,
  ${SOURCE_TABLE}.sum_bid_depth,
  ${SOURCE_TABLE}.sum_ask_depth,
  ${SOURCE_TABLE}.sum_price_volume,
  ${SOURCE_TABLE}.unknown_volume
`;

const HYDRATION_QUERY = `
  WITH ranked AS (
    SELECT
      ${SOURCE_COLUMNS},
      ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY time DESC) AS rn
    FROM ${SOURCE_TABLE}
    WHERE time = date_trunc('hour', time)
  )
  SELECT
    ${SOURCE_COLUMNS}
  FROM ranked
  WHERE rn <= $1
  ORDER BY ticker ASC, time ASC
`;

const LATEST_TARGET_TIMES_QUERY = `
  SELECT DISTINCT ON (ticker)
    ticker,
    time AS latest_target_time
  FROM ${TARGET_TABLE}
  ORDER BY ticker ASC, time DESC
`;

interface QueryResultLike<Row> {
  rows: Row[];
}

interface Queryable {
  query: <Row = unknown>(text: string, values?: unknown[]) => Promise<QueryResultLike<Row>>;
}

interface LatestTargetRow {
  ticker: string;
  latest_target_time: Date | string;
}

interface ReconciliationSourceRow extends StoredCandleRow {
  latest_target_time: Date | string;
}

interface ReconciliationCursor {
  ticker: string;
  time: string;
}

interface ReconciliationResult {
  seeded: number;
  replayed: number;
}

interface Candles1d1hAggregatorOptions {
  queryable?: Queryable;
  writeCandlesFn?: typeof writeCandles;
}

export class Candles1d1hAggregator {
  private readonly queryable: Queryable;
  private readonly writeCandlesFn: typeof writeCandles;
  private readonly rollingWindow = new RollingCandleWindow({
    windowSize: WINDOW_HOURS,
    expectedIntervalMs: 60 * 60 * 1000,
    label: "1d@1h",
  });

  private initialized = false;
  private candlesWritten = 0;
  private bufferedBaseCandles: CandleForDb[] = [];
  private hydrationPromise: Promise<boolean> | null = null;
  private lastHydrationBlockedLogTime = 0;

  constructor(options: Candles1d1hAggregatorOptions = {}) {
    this.queryable = options.queryable ?? pool;
    this.writeCandlesFn = options.writeCandlesFn ?? writeCandles;
  }

  async initialize(): Promise<void> {
    await this.ensureInitialized();
  }

  addBaseCandles(candles: CandleForDb[]): number {
    const hourBoundaryCandles = candles.filter((candle) => isHourBoundary(candle.time));
    if (hourBoundaryCandles.length === 0) {
      return 0;
    }

    if (!this.initialized) {
      this.bufferedBaseCandles.push(...hourBoundaryCandles);
      return hourBoundaryCandles.length;
    }

    return this.rollingWindow.addCandles(hourBoundaryCandles);
  }

  async flushCompleted(): Promise<void> {
    const ready = await this.ensureInitialized();
    if (!ready) {
      this.maybeLogHydrationBlocked();
      return;
    }

    await this.flushPendingCandles();
  }

  async flushAll(): Promise<void> {
    await this.flushCompleted();
  }

  getCandlesWritten(): number {
    return this.candlesWritten;
  }

  private async flushPendingCandles(): Promise<void> {
    const pendingCandles = this.rollingWindow.drainPendingCandles();
    if (pendingCandles.length === 0) {
      return;
    }

    let written = 0;
    let dropped = 0;
    const retryCandles: CandleForDb[] = [];

    for (let i = 0; i < pendingCandles.length; i += WRITE_BATCH_SIZE) {
      const batch = pendingCandles.slice(i, i + WRITE_BATCH_SIZE);

      try {
        await this.writeCandlesFn(this.queryable, TARGET_TABLE, batch);
        written += batch.length;
        this.candlesWritten += batch.length;
      } catch (error) {
        dropped += batch.length;
        retryCandles.push(...batch);
        console.error(`❌ Failed to write ${TARGET_TABLE} candles:`, error);
      }
    }

    if (retryCandles.length > 0) {
      this.rollingWindow.requeuePendingCandles(retryCandles);
    }

    if (written > 0) {
      console.log(`✅ Flushed ${written} rolling 1d candle(s) to ${TARGET_TABLE}`);
    }
    if (dropped > 0) {
      console.warn(`⚠️ Requeued ${dropped} rolling 1d candle(s) after DB write failures`);
    }
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    if (this.hydrationPromise) {
      return this.hydrationPromise;
    }

    this.hydrationPromise = this.hydrateFromDatabase().finally(() => {
      this.hydrationPromise = null;
    });
    return this.hydrationPromise;
  }

  private async hydrateFromDatabase(): Promise<boolean> {
    try {
      const latestTargetTimes = await this.loadLatestTargetTimes();
      const recentSourceRows = await this.queryable.query<StoredCandleRow>(HYDRATION_QUERY, [HYDRATION_WINDOW_ROWS]);

      const latestTargetTimeByTicker = new Map(
        latestTargetTimes.map((row) => [row.ticker, new Date(row.latest_target_time).getTime()]),
      );
      const recentSeedCandles = recentSourceRows.rows
        .filter((row) => !latestTargetTimeByTicker.has(row.ticker))
        .map((row) => candleForDbFromStoredRow(row, { requireCompleteCvd: true }));
      const reconciliation = await this.reconcileFromSource(latestTargetTimes);
      const seedCandles = [...recentSeedCandles];
      this.rollingWindow.seedCandles(seedCandles);

      const totalSeeded = seedCandles.length + reconciliation.seeded;
      if (totalSeeded > 0) {
        console.log(`📚 Hydrated ${totalSeeded} canonical 1h row(s) into ${TARGET_TABLE}`);
      } else {
        console.log(`📚 No canonical 1h rows available yet to hydrate ${TARGET_TABLE}`);
      }
      if (reconciliation.replayed > 0) {
        console.log(`🔁 Replayed ${reconciliation.replayed} canonical 1h row(s) newer than ${TARGET_TABLE}`);
      }

      const replayed = this.replayBufferedBaseCandles();
      if (replayed > 0) {
        console.log(`📥 Replayed ${replayed} buffered canonical 1h row(s) into ${TARGET_TABLE}`);
      }

      this.initialized = true;
      await this.flushPendingCandles();

      return true;
    } catch (error) {
      console.warn(`⚠️ Could not hydrate ${TARGET_TABLE} from ${SOURCE_TABLE}; will retry:`, error);
      return false;
    }
  }

  private replayBufferedBaseCandles(): number {
    if (this.bufferedBaseCandles.length === 0) {
      return 0;
    }

    const buffered = this.bufferedBaseCandles;
    this.bufferedBaseCandles = [];
    return this.rollingWindow.addCandles(buffered);
  }

  private async loadLatestTargetTimes(): Promise<LatestTargetRow[]> {
    const result = await this.queryable.query<LatestTargetRow>(LATEST_TARGET_TIMES_QUERY);
    return result.rows;
  }

  private async reconcileFromSource(latestTargetTimes: LatestTargetRow[]): Promise<ReconciliationResult> {
    if (latestTargetTimes.length === 0) {
      return { seeded: 0, replayed: 0 };
    }

    let cursor: ReconciliationCursor | null = null;
    let seeded = 0;
    let replayed = 0;

    while (true) {
      const rows = await this.loadReconciliationRows(latestTargetTimes, cursor);
      if (rows.length === 0) {
        break;
      }

      const reconciliationSeedCandles: CandleForDb[] = [];
      const reconciliationReplayCandles: CandleForDb[] = [];
      for (const row of rows) {
        const candle = candleForDbFromStoredRow(row, { requireCompleteCvd: true });
        const latestTargetTimeMs = new Date(row.latest_target_time).getTime();

        if (new Date(candle.time).getTime() <= latestTargetTimeMs) {
          reconciliationSeedCandles.push(candle);
        } else {
          reconciliationReplayCandles.push(candle);
        }
      }

      if (reconciliationSeedCandles.length > 0) {
        seeded += reconciliationSeedCandles.length;
        this.rollingWindow.seedCandles(reconciliationSeedCandles);
      }
      if (reconciliationReplayCandles.length > 0) {
        replayed += this.rollingWindow.addCandles(reconciliationReplayCandles);
      }
      if (this.rollingWindow.getStats().pendingCandles >= RECONCILIATION_FLUSH_THRESHOLD) {
        await this.flushPendingCandles();
      }

      const lastRow = rows[rows.length - 1];
      cursor = {
        ticker: lastRow.ticker,
        time: lastRow.time instanceof Date ? lastRow.time.toISOString() : new Date(lastRow.time).toISOString(),
      };
    }

    return { seeded, replayed };
  }

  private async loadReconciliationRows(
    latestTargetTimes: LatestTargetRow[],
    cursor: ReconciliationCursor | null,
  ): Promise<ReconciliationSourceRow[]> {
    const values: unknown[] = [];
    const placeholders = latestTargetTimes.map((row, index) => {
      const offset = index * 2;
      values.push(
        row.ticker,
        row.latest_target_time instanceof Date ? row.latest_target_time.toISOString() : row.latest_target_time,
      );
      return `($${offset + 1}, $${offset + 2}::timestamptz)`;
    });
    const cursorTickerIndex = values.length + 1;
    const cursorTimeIndex = values.length + 2;
    const limitIndex = values.length + 3;
    values.push(cursor?.ticker ?? "", cursor?.time ?? "1970-01-01T00:00:00.000Z", String(RECONCILIATION_PAGE_SIZE));

    const query = `
      WITH latest_target(ticker, latest_target_time) AS (
        VALUES ${placeholders.join(", ")}
      )
      SELECT
        ${SOURCE_COLUMNS_FROM_SOURCE_TABLE},
        latest_target.latest_target_time
      FROM ${SOURCE_TABLE}
      JOIN latest_target
        ON latest_target.ticker = ${SOURCE_TABLE}.ticker
      WHERE time = date_trunc('hour', time)
        AND time >= latest_target.latest_target_time - INTERVAL '${WINDOW_HOURS - 1} hours'
        AND (
          $${cursorTickerIndex} = ''
          OR (${SOURCE_TABLE}.ticker, ${SOURCE_TABLE}.time) > ($${cursorTickerIndex}, $${cursorTimeIndex}::timestamptz)
        )
      ORDER BY ${SOURCE_TABLE}.ticker ASC, ${SOURCE_TABLE}.time ASC
      LIMIT $${limitIndex}::int
    `;

    const result = await this.queryable.query<ReconciliationSourceRow>(query, values);
    return result.rows;
  }

  private maybeLogHydrationBlocked(): void {
    const now = Date.now();
    if (now - this.lastHydrationBlockedLogTime < HYDRATION_RETRY_LOG_INTERVAL_MS) {
      return;
    }

    console.warn(
      `⚠️ ${TARGET_TABLE} is still waiting on startup hydration; ` +
        `buffered ${this.bufferedBaseCandles.length} hour-boundary base candle(s) for retry`,
    );
    this.lastHydrationBlockedLogTime = now;
  }
}
