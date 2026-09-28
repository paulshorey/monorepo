# write-node docs

This folder documents the current write pipeline only.

## Read this first

- `project-context.md` - concise project purpose, boundaries, and downstream plan
- `backfill.md` - end-to-end runbook for historical TBBO -> 1m@1s -> 1h@1m -> 1d@1h

## Current system

- ingest TBBO trades from Databento
- stitch contracts into a front-month ticker series
- build rolling 1-minute candles
- write one candle row every second to `candles_1m_1s`
- derive rolling 1-hour candles from minute-boundary `candles_1m_1s` rows
- write one hourly row every minute to `candles_1h_1m`
- derive rolling 1-day candles from hour-boundary `candles_1h_1m` rows
- write one daily row every hour to `candles_1d_1h`

## Roadmap the docs should assume

- current: `1m` candles at `1s` resolution
- current: `1h` candles at `1m` resolution
- current: `1d` candles at `1h` resolution

## Kept documents

### Storage

- `data-storage/candles-schema.md` - current source-of-truth table and write model
- `data-storage/1s-base-1m-aggregate.sql` - base table setup for `candles_1m_1s`
- `data-storage/1m-base-1h-aggregate.sql` - derived table setup for `candles_1h_1m`
- `data-storage/databento/ingesting/databento-live-data.md` - live ingest behavior
- `data-storage/databento/ingesting/databento-historical-data.md` - historical ingest behavior

### Metrics

- `data-indicators/tbbo.md` - metric definitions stored per row
- `data-indicators/cvd-from-tbbo.md` - how CVD is produced from classified trades

## Removed material

Older docs about:

- `ohlcv_*` schemas
- `minute_index` / `second_index`
- RSI worker prototypes
- Prisma schema generation
- backtesting experiments inside this app

were removed because they no longer describe the app that exists today.
