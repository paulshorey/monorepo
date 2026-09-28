import type { CandleForDb, CandleState } from "./types.js";

export interface StoredCandleRow {
  time: Date | string;
  ticker: string;
  symbol: string | null;
  open: number | string;
  high: number | string;
  low: number | string;
  close: number | string;
  volume: number | string | null;
  ask_volume: number | string | null;
  bid_volume: number | string | null;
  cvd_open: number | string | null;
  cvd_high: number | string | null;
  cvd_low: number | string | null;
  cvd_close: number | string | null;
  trades: number | string | null;
  max_trade_size: number | string | null;
  big_trades: number | string | null;
  big_volume: number | string | null;
  vd: number | string | null;
  vd_ratio: number | string | null;
  book_imbalance: number | string | null;
  price_pct: number | string | null;
  divergence: number | string | null;
  sum_bid_depth: number | string | null;
  sum_ask_depth: number | string | null;
  sum_price_volume: number | string | null;
  unknown_volume: number | string | null;
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "number" ? value : Number(value) || 0;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

interface StoredRowConversionOptions {
  requireCompleteCvd?: boolean;
}

function assertCompleteCvd(row: StoredCandleRow): void {
  if (row.cvd_open !== null && row.cvd_high !== null && row.cvd_low !== null && row.cvd_close !== null) {
    return;
  }

  throw new Error(
    `Stored candle row for ${row.ticker} at ${toIsoString(row.time)} is missing complete CVD OHLC ` +
      `and cannot be used as canonical hourly source data`,
  );
}

export function candleStateFromStoredRow(row: StoredCandleRow, options: StoredRowConversionOptions = {}): CandleState {
  if (options.requireCompleteCvd) {
    assertCompleteCvd(row);
  }

  const cvdOpen = row.cvd_open === null ? null : toNumber(row.cvd_open);
  const cvdHigh = row.cvd_high === null ? null : toNumber(row.cvd_high);
  const cvdLow = row.cvd_low === null ? null : toNumber(row.cvd_low);
  const cvdClose = row.cvd_close === null ? null : toNumber(row.cvd_close);

  return {
    open: toNumber(row.open),
    high: toNumber(row.high),
    low: toNumber(row.low),
    close: toNumber(row.close),
    volume: toNumber(row.volume),
    askVolume: toNumber(row.ask_volume),
    bidVolume: toNumber(row.bid_volume),
    unknownSideVolume: toNumber(row.unknown_volume),
    sumBidDepth: toNumber(row.sum_bid_depth),
    sumAskDepth: toNumber(row.sum_ask_depth),
    sumSpread: 0,
    sumMidPrice: 0,
    sumPriceVolume: toNumber(row.sum_price_volume),
    maxTradeSize: toNumber(row.max_trade_size),
    largeTradeCount: toNumber(row.big_trades),
    largeTradeVolume: toNumber(row.big_volume),
    symbol: row.symbol ?? row.ticker,
    tradeCount: toNumber(row.trades),
    currentCvd: cvdClose ?? undefined,
    metricsOHLC:
      cvdOpen !== null && cvdHigh !== null && cvdLow !== null && cvdClose !== null
        ? {
            cvd: {
              open: cvdOpen,
              high: cvdHigh,
              low: cvdLow,
              close: cvdClose,
            },
          }
        : undefined,
  };
}

export function candleForDbFromStoredRow(row: StoredCandleRow, options: StoredRowConversionOptions = {}): CandleForDb {
  const time = toIsoString(row.time);

  return {
    key: `${row.ticker}|${time}`,
    ticker: row.ticker,
    time,
    candle: candleStateFromStoredRow(row, options),
  };
}
