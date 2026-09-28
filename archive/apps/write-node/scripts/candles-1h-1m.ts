#!/usr/bin/env npx tsx
/**
 * Historical rebuild for canonical rolling `candles_1h_1m`.
 *
 * This script derives 1-hour candles at 1-minute resolution from the canonical
 * minute-boundary rows already written into `candles_1m_1s`.
 */

import "dotenv/config";
import { pool } from "../src/lib/db.js";
import type { CandleForDb, StoredCandleRow } from "../src/lib/trade/index.js";
import { RollingCandleWindow, candleForDbFromStoredRow, writeCandles } from "../src/lib/trade/index.js";

const SOURCE_TABLE = "candles_1m_1s";
const TARGET_TABLE = "candles_1h_1m";
const SOURCE_PAGE_SIZE = 5_000;
const WRITE_BATCH_SIZE = 1_000;
const FLUSH_THRESHOLD = 10_000;
const WINDOW_MINUTES = 60;

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

const rollingWindow = new RollingCandleWindow({
  windowSize: WINDOW_MINUTES,
  expectedIntervalMs: 60_000,
  label: "1h@1m",
});

const stats = {
  sourceRowsRead: 0,
  hourlyCandlesWritten: 0,
  pagesRead: 0,
};

async function truncateTargetTable(): Promise<void> {
  await pool.query(`TRUNCATE TABLE ${TARGET_TABLE}`);
  console.log(`🧹 Truncated ${TARGET_TABLE}`);
}

async function fetchSourcePage(cursor: { ticker: string; time: string } | null): Promise<StoredCandleRow[]> {
  if (!cursor) {
    const result = await pool.query<StoredCandleRow>(
      `
        SELECT ${SOURCE_COLUMNS}
        FROM ${SOURCE_TABLE}
        WHERE time = date_trunc('minute', time)
        ORDER BY ticker ASC, time ASC
        LIMIT $1
      `,
      [SOURCE_PAGE_SIZE],
    );
    return result.rows;
  }

  const result = await pool.query<StoredCandleRow>(
    `
      SELECT ${SOURCE_COLUMNS}
      FROM ${SOURCE_TABLE}
      WHERE time = date_trunc('minute', time)
        AND (ticker, time) > ($1, $2::timestamptz)
      ORDER BY ticker ASC, time ASC
      LIMIT $3
    `,
    [cursor.ticker, cursor.time, SOURCE_PAGE_SIZE],
  );
  return result.rows;
}

async function flushPendingCandles(): Promise<void> {
  const pendingCandles = rollingWindow.drainPendingCandles();
  if (pendingCandles.length === 0) {
    return;
  }

  for (let i = 0; i < pendingCandles.length; i += WRITE_BATCH_SIZE) {
    const batch = pendingCandles.slice(i, i + WRITE_BATCH_SIZE);
    await writeCandles(pool, TARGET_TABLE, batch);
    stats.hourlyCandlesWritten += batch.length;
  }

  console.log(`💾 Flushed ${pendingCandles.length} rolling 1h candle(s) to ${TARGET_TABLE}`);
}

async function processHistoricalBaseRows(): Promise<void> {
  let cursor: { ticker: string; time: string } | null = null;

  while (true) {
    const rows = await fetchSourcePage(cursor);
    if (rows.length === 0) {
      break;
    }

    stats.pagesRead++;
    stats.sourceRowsRead += rows.length;

    const candles = rows.map((row) => candleForDbFromStoredRow(row, { requireCompleteCvd: true }));
    rollingWindow.addCandles(candles);

    if (rollingWindow.getStats().pendingCandles >= FLUSH_THRESHOLD) {
      await flushPendingCandles();
    }

    const lastRow = rows[rows.length - 1];
    const lastTime = lastRow.time instanceof Date ? lastRow.time.toISOString() : new Date(lastRow.time).toISOString();
    cursor = { ticker: lastRow.ticker, time: lastTime };

    if (stats.pagesRead % 10 === 0) {
      console.log(
        `📊 ${stats.sourceRowsRead.toLocaleString()} source minute row(s) read, ` +
          `${stats.hourlyCandlesWritten.toLocaleString()} hourly candle(s) written, ` +
          `${rollingWindow.getStats().pendingCandles.toLocaleString()} pending`,
      );
    }
  }

  await flushPendingCandles();
}

function printSummary(): void {
  const windowStats = rollingWindow.getStats();

  console.log("\n" + "═".repeat(60));
  console.log("📊 1h@1m Rebuild Complete");
  console.log("═".repeat(60));
  console.log(`   Source table:          ${SOURCE_TABLE}`);
  console.log(`   Target table:          ${TARGET_TABLE}`);
  console.log(`   Source rows read:      ${stats.sourceRowsRead.toLocaleString()}`);
  console.log(`   Hourly candles wrote:  ${stats.hourlyCandlesWritten.toLocaleString()}`);
  console.log(`   Pages read:            ${stats.pagesRead.toLocaleString()}`);
  console.log(`   Warmup skipped:        ${windowStats.candlesSkippedWarmup.toLocaleString()}`);
  console.log(`   Gap resets:            ${windowStats.gapResets.toLocaleString()}`);
  console.log(`   Duplicates ignored:    ${windowStats.duplicateInputsIgnored.toLocaleString()}`);
  console.log(`   Out-of-order ignored:  ${windowStats.outOfOrderInputsIgnored.toLocaleString()}`);
  console.log("═".repeat(60));
}

async function main(): Promise<void> {
  const shouldTruncate = process.argv.includes("--truncate");

  console.log("═".repeat(60));
  console.log("📊 Historical 1h@1m rebuild");
  console.log("═".repeat(60));
  console.log(`   Source table: ${SOURCE_TABLE}`);
  console.log(`   Target table: ${TARGET_TABLE}`);
  console.log(`   Window size:  ${WINDOW_MINUTES} minute(s)`);
  console.log(`   Truncate:     ${shouldTruncate ? "yes" : "no"}`);
  console.log("");

  if (shouldTruncate) {
    await truncateTargetTable();
  }

  await processHistoricalBaseRows();
  printSummary();
  await pool.end();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
