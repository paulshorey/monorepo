#!/usr/bin/env npx tsx
/**
 * Historical TBBO Data Processor (1-Minute Rolling Candles at 1-Second Resolution)
 *
 * Processes historical TBBO trade data from JSONL files and writes
 * rolling 1-minute candles to the database, one row per second.
 * Historical TBBO ingest for the rolling `candles_1m_1s` table.
 *
 * Each output row represents the trailing 60-second window of trade data.
 * This gives 1-minute candles at 1-second resolution — 60 rows per minute
 * instead of the traditional 1 row per minute.
 * Short no-trade gaps are forward-filled as zero-volume seconds. Extended gaps
 * reset warmup so the window never pretends distant activity was contiguous.
 *
 * The batch path shares the same rolling-window engine as live ingest so both
 * modes generate the same stitched front-month candles and CVD values.
 *
 * Algorithm:
 *   1. Trades are aggregated into 1-second buckets
 *   2. Each completed 1-second bucket is stored as a SecondSummary
 *   3. A sliding window of the last 60 SecondSummaries is maintained per ticker
 *   4. Each second, the window is aggregated into a single 1-minute candle
 *   5. The 1-minute candle is written to the database
 *
 * Warmup: No output is written until the sliding window spans a full
 * 60 seconds. This means the first ~59 seconds produce no database rows.
 *
 * Usage:
 *   npx tsx scripts/tbbo-1m-1s.ts <file1.json> [file2.json] ...
 *   npx tsx scripts/tbbo-1m-1s.ts ./data/*.json
 */

import "dotenv/config";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { pool } from "../src/lib/db.js";
import type { NormalizedTrade, TimedTradeInput } from "../src/lib/trade/index.js";
import {
  RollingWindow1m,
  determineTradeSide,
  extractTicker,
  getConfiguredMarketSessionForTicker,
  toMinuteBucket,
  toSecondBucket,
  writeCandles,
} from "../src/lib/trade/index.js";

interface HistoricalTbboLevel {
  bid_px?: string | number;
  ask_px?: string | number;
  bid_sz?: number;
  ask_sz?: number;
}

interface HistoricalTbboJson {
  ts_recv?: string | number;
  timestamp?: string | number;
  hd?: {
    ts_event?: string | number;
  };
  action?: string;
  side?: string;
  price: string | number;
  size: number;
  symbol: string;
  bid_px?: string | number;
  ask_px?: string | number;
  bidPrice?: number;
  askPrice?: number;
  bid_sz?: number;
  ask_sz?: number;
  levels?: HistoricalTbboLevel[];
}

const TARGET_TABLE = "candles_1m_1s";
const BATCH_SIZE = 1000;
const FLUSH_THRESHOLD = 10_000;
const LOG_INTERVAL = 100_000;
const WINDOW_SECONDS = 60;

const rollingWindow = new RollingWindow1m();

const stats = {
  filesProcessed: 0,
  linesProcessed: 0,
  tradesProcessed: 0,
  candlesWritten: 0,
  skippedNonTrade: 0,
  skippedSpreads: 0,
  unknownSide: 0,
  parseErrors: 0,
};

async function loadCvdFromDatabase(): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (ticker) ticker, cvd_close AS cvd
      FROM ${TARGET_TABLE}
      WHERE cvd_close IS NOT NULL
      ORDER BY ticker, time DESC
    `);

    for (const row of result.rows) {
      const cvd = Number(row.cvd) || 0;
      rollingWindow.seedTickerCvd(row.ticker, cvd);
      console.log(`📈 Loaded CVD for ${row.ticker}: ${cvd.toLocaleString()}`);
    }

    console.log(`✅ Loaded CVD for ${result.rows.length} ticker(s) from database\n`);
  } catch (error) {
    console.warn("⚠️ Could not load CVD from database, starting fresh:", error);
  }
}

function parseHistoricalTbbo(line: string): TimedTradeInput | null {
  try {
    const json: HistoricalTbboJson = JSON.parse(line);

    if (json.action !== undefined && json.action !== "T") {
      stats.skippedNonTrade++;
      return null;
    }

    if (!json.symbol || json.symbol.includes("-")) {
      stats.skippedSpreads++;
      return null;
    }

    const price = typeof json.price === "number" ? json.price : parseFloat(json.price);
    if (!Number.isFinite(price) || price <= 0) {
      return null;
    }

    const timestamp = json.hd?.ts_event ?? json.ts_recv ?? json.timestamp;
    if (timestamp === undefined || timestamp === null) {
      return null;
    }

    const level = json.levels?.[0];
    const bidPxRaw = level?.bid_px ?? json.bid_px;
    const askPxRaw = level?.ask_px ?? json.ask_px;
    const bidPrice = json.bidPrice ?? parseOptionalNumber(bidPxRaw);
    const askPrice = json.askPrice ?? parseOptionalNumber(askPxRaw);
    const bidSize = level?.bid_sz ?? json.bid_sz ?? 0;
    const askSize = level?.ask_sz ?? json.ask_sz ?? 0;
    const { isAsk, isBid } = determineTradeSide(json.side || "", price, bidPrice, askPrice);

    if (!isAsk && !isBid) {
      stats.unknownSide++;
    }

    const trade: NormalizedTrade = {
      ticker: extractTicker(json.symbol),
      price,
      size: json.size || 0,
      isAsk,
      isBid,
      symbol: json.symbol,
      bidPrice,
      askPrice,
      bidSize,
      askSize,
    };

    return {
      trade,
      secondBucket: toSecondBucket(timestamp),
      minuteBucket: toMinuteBucket(timestamp),
    };
  } catch {
    stats.parseErrors++;
    return null;
  }
}

function parseOptionalNumber(value: string | number | undefined): number {
  if (value === undefined) {
    return 0;
  }
  return typeof value === "number" ? value : parseFloat(String(value)) || 0;
}

async function flushPendingCandles(): Promise<void> {
  const pendingCandles = rollingWindow.drainPendingCandles();
  if (pendingCandles.length === 0) {
    return;
  }

  for (let i = 0; i < pendingCandles.length; i += BATCH_SIZE) {
    const batch = pendingCandles.slice(i, i + BATCH_SIZE);
    await writeCandles(pool, TARGET_TABLE, batch);
    stats.candlesWritten += batch.length;
  }

  console.log(`💾 Flushed ${pendingCandles.length} rolling 1m candle(s) to ${TARGET_TABLE}`);
}

async function processFile(filePath: string): Promise<void> {
  console.log(`\n📂 Processing: ${filePath}`);

  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let fileTicker: string | null = null;

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    const parsed = parseHistoricalTbbo(line);
    if (parsed && !fileTicker) {
      fileTicker = parsed.trade.ticker;
      console.log(`   🕒 Session: ${getConfiguredMarketSessionForTicker(fileTicker).describe()}`);
    }
    if (parsed && rollingWindow.addTrade(parsed)) {
      stats.tradesProcessed++;
    }

    lineCount++;
    stats.linesProcessed++;

    if (stats.linesProcessed % LOG_INTERVAL === 0) {
      console.log(
        `   📊 ${stats.linesProcessed.toLocaleString()} lines, ` +
          `${stats.tradesProcessed.toLocaleString()} trades, ` +
          `${rollingWindow.getStats().secondsProcessed.toLocaleString()} seconds, ` +
          `${rollingWindow.getStats().pendingCandles.toLocaleString()} pending candles`,
      );
    }

    if (rollingWindow.getStats().pendingCandles >= FLUSH_THRESHOLD) {
      await flushPendingCandles();
    }
  }

  rollingWindow.finalizeAll();
  await flushPendingCandles();

  stats.filesProcessed++;
  console.log(`   ✅ Completed: ${lineCount.toLocaleString()} lines`);
}

function printSummary(): void {
  const rollingStats = rollingWindow.getStats();
  const volumeBySymbol = [...rollingWindow.getTotalVolumeBySymbol().entries()].sort((a, b) => b[1] - a[1]);

  console.log("\n" + "═".repeat(60));
  console.log("📊 Processing Complete");
  console.log("═".repeat(60));
  console.log(`   Files processed:       ${stats.filesProcessed}`);
  console.log(`   Lines processed:       ${stats.linesProcessed.toLocaleString()}`);
  console.log(`   Trades processed:      ${stats.tradesProcessed.toLocaleString()}`);
  console.log(`   1-second buckets:      ${rollingStats.secondsProcessed.toLocaleString()}`);
  console.log(`   1-minute candles:      ${stats.candlesWritten.toLocaleString()}`);
  console.log(`   Skipped (warmup):      ${rollingStats.candlesSkippedWarmup.toLocaleString()}`);
  console.log(`   Synthetic seconds:     ${rollingStats.syntheticSecondsFilled.toLocaleString()}`);
  console.log(`   Gap resets:            ${rollingStats.gapResets.toLocaleString()}`);
  console.log(`   Out-of-order ignored:  ${rollingStats.outOfOrderTradesIgnored.toLocaleString()}`);
  console.log(`   Skipped (non-front):   ${rollingStats.skippedNonFront.toLocaleString()}`);
  console.log(`   Skipped (spreads):     ${stats.skippedSpreads.toLocaleString()}`);
  console.log(`   Skipped (non-trade):   ${stats.skippedNonTrade.toLocaleString()}`);
  console.log(`   Unknown side:          ${stats.unknownSide.toLocaleString()}`);
  console.log(`   Parse errors:          ${stats.parseErrors.toLocaleString()}`);
  console.log("");
  console.log("   Active contract per ticker:");
  for (const [ticker, symbol] of Object.entries(rollingStats.activeContracts)) {
    const volume = rollingWindow.getTotalVolumeBySymbol().get(symbol) || 0;
    console.log(`     ${ticker} → ${symbol} (vol ${volume.toLocaleString()})`);
  }
  console.log("");
  console.log("   Volume by contract:");
  for (const [symbol, volume] of volumeBySymbol) {
    console.log(`     ${symbol} (${extractTicker(symbol)}): ${volume.toLocaleString()}`);
  }
  console.log("");
  console.log("   Ring buffer state per ticker:");
  for (const snapshot of rollingWindow.getTickerSnapshots()) {
    console.log(`     ${snapshot.ticker}: ${snapshot.ringSize} seconds in buffer, CVD ${snapshot.runningCvd.toLocaleString()}`);
  }
  console.log("═".repeat(60));
}

async function main(): Promise<void> {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.error("Usage: npx tsx scripts/tbbo-1m-1s.ts <file1.json> [file2.json] ...");
    console.error("       npx tsx scripts/tbbo-1m-1s.ts ./data/*.json");
    process.exit(1);
  }

  console.log("═".repeat(60));
  console.log("📊 Historical TBBO Processor (1-minute rolling candles @ 1s resolution)");
  console.log("═".repeat(60));
  console.log(`   Files to process: ${files.length}`);
  console.log(`   Target table:     ${TARGET_TABLE}`);
  console.log(`   Window size:      ${WINDOW_SECONDS} seconds`);
  console.log("");

  await loadCvdFromDatabase();

  for (const file of files) {
    await processFile(file);
  }

  printSummary();
  await pool.end();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
