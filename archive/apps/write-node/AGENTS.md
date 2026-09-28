# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# write-node

Canonical futures timeseries write pipeline.

## Current scope

This app ingests TBBO trade data and maintains three canonical rolling
timeseries tables, each layer derived deterministically from boundary rows of
the layer below:

- **`candles_1m_1s`**: rolling 1-minute candles written at 1-second resolution
- **`candles_1h_1m`**: rolling 1-hour candles written at 1-minute resolution
- **`candles_1d_1h`**: rolling 1-day candles written at 1-hour resolution

`candles_1m_1s` is built directly from TBBO trades.

`candles_1h_1m` is built from the **minute-boundary subset** of
`candles_1m_1s`, not directly from raw trades.

`candles_1d_1h` is built from the **hour-boundary subset** of
`candles_1h_1m`, not directly from minute rows or raw trades.

Each `candles_1m_1s` row is the trailing 60-second window for a ticker at that
second:

- input resolution: individual TBBO trades
- output timeframe: 1 minute
- output write cadence: 1 second
- short no-trade gaps are forward-filled as zero-volume seconds
- extended open-market inactivity resets the rolling warmup instead of stitching distant seconds together
- scheduled closures from the configured session calendar are treated as paused time so rolling VWAP/CVD continuity carries across closes and reopens

Each `candles_1h_1m` row is the trailing 60-minute window for a ticker at that
minute:

- input resolution: canonical 1-minute rows
- output timeframe: 1 hour
- output write cadence: 1 minute
- the source rows are the minute-boundary subset produced by the shared 1m engine

Each `candles_1d_1h` row is the trailing 24-hour window for a ticker at that
hour:

- input resolution: canonical 1-hour rows
- output timeframe: 1 day
- output write cadence: 1 hour
- the source rows are the hour-boundary subset of `candles_1h_1m`

The app has two ingest modes:

- `src/stream/tbbo-stream.ts` for live Databento TCP data
- `scripts/tbbo-1m-1s.ts` for historical TBBO -> `candles_1m_1s`
- `scripts/candles-1h-1m.ts` for historical `candles_1m_1s` -> `candles_1h_1m`
- `scripts/candles-1d-1h.ts` for historical `candles_1h_1m` -> `candles_1d_1h`

Both paths must stay aligned and should share aggregation logic whenever
possible.

## Project goal

`write-node` is responsible for producing and maintaining **canonical
financial timeseries data** from historical and live market data.

This data is intended to be a durable source of truth for downstream apps.
The writer pipeline should be deterministic, explainable, and conservative
about schema and logic changes.

## Timeframe model

Do not redesign this app around traditional end-of-period-only candles.

The intended write model is:

- `1m` candles written at `1s` resolution
- `1h` candles written at `1m` resolution

The saved resolution is therefore finer than the candle timeframe, because each
row represents a rolling window that is recalculated on a higher-frequency
schedule.

## Runtime architecture

```
src/index.ts
  -> src/stream/tbbo-stream.ts
  -> src/stream/tbbo-1m-aggregator.ts
  -> src/stream/candles-1h-1m-aggregator.ts
  -> src/stream/candles-1d-1h-aggregator.ts
  -> src/lib/trade/*
  -> TimescaleDB candles_1m_1s
  -> TimescaleDB candles_1h_1m
  -> TimescaleDB candles_1d_1h
```

The HTTP surface is intentionally minimal. Only:

- `GET /api/v1/health` — liveness check
- `GET /api/v1/stats` — read-only stream + aggregator snapshot for ops

Key rules:

- keep the runtime focused on writing data, not serving an API
- use `TIMESCALE_DB_URL` through `@lib/db-timescale`
- keep front-month stitching and rolling-window aggregation deterministic
- prefer shared library code over duplicated live/batch logic
- treat written tables as source-of-truth data, not disposable intermediate output
- define market-session windows in local exchange time with an IANA time zone; do not hardcode fixed UTC close/reopen hours
- `1h@1m` must be derived from minute-boundary `1m@1s` rows
- `1d@1h` must be derived from hour-boundary `1h@1m` rows
- do not derive `1h@1m` directly from raw trades
- do not derive `1d@1h` directly from minute rows or raw trades
- do not compute `1h` every second or `1d` every minute; cadence is the next-coarser timeframe
- keep column contracts aligned with `@lib/db-timescale` migrations, schema snapshot, and generated types
- `price_pct` is stored in basis points, not percent
- `sum_price_volume` is the stored VWAP accumulator; there is no canonical per-row `vwap` column
- do not create or alter Timescale tables manually; change `@lib/db-timescale/migrations`
- fresh empty DB: run `db:migrate`, not `db:migrate:baseline`
- existing pre-migration DB with baseline schema already present: run `db:migrate:baseline` once, then `db:migrate`
- after DB contract changes, run `pnpm --filter @lib/db-timescale db:verify`
- if a migration must change populated data, the migration SQL must backfill or convert existing rows explicitly

## Source layout

```
src/
  index.ts
  lib/
    db.ts
    metrics/
    trade/
  stream/
    tbbo-stream.ts
    tbbo-1m-aggregator.ts
    candles-1h-1m-aggregator.ts
    candles-1d-1h-aggregator.ts
scripts/
  tbbo-1m-1s.ts
  candles-1h-1m.ts
  candles-1d-1h.ts
docs/
  index.md
  backfill.md
```

## Relationship to other apps

`write-node` stops at **canonical timeseries writing**.

The downstream Python research app `apps/backtest-python` consumes these
canonical tables to:

- align rows across multiple canonical timeframes (1m@1s, 1h@1m, planned 1d@1h)
- compute multi-period indicators (RSI, MACD, etc.) and CVD-derived features
- write derived feature timeseries to `features_v1` and similar downstream tables
- train and evaluate ML models, persist runs to `models` / `backtests` / `predictions`

That downstream feature-engineering, ML, and backtesting workflow must not be
folded back into `write-node`.

See `docs/project/roadmap.md` and `docs/project/backtest-python.md` at the
repo root for the full plan.

## Roadmap

Already shipped:

- `candles_1m_1s` (rolling 60-second window written every second)
- `candles_1h_1m` (rolling 60-minute window written every minute)
- `candles_1d_1h` (rolling 24-hour window written every hour, derived from
  hour-boundary rows of `candles_1h_1m`)
- `/api/v1/stats` ops endpoint

Supported ticker set for live ingest: ES, NQ, RTY, YM, CL, GC, SI, HG, NG
(Globex) plus NK (Tokyo). Adding more tickers requires only:

- entry in `SESSION_PROFILE_BY_TICKER`
- entry in `LARGE_TRADE_THRESHOLDS` (or fallback to `DEFAULT`)
- inclusion in the live `DATABENTO_SYMBOLS` env var

Phase 1 wrap-up tasks tracked in
`docs/project/write-node-completion.md` are operational only (production env
config + first full backfill + warmup verification). No further code changes
are planned in this phase.

## Documentation

Only keep docs that match the current writer pipeline and near-term roadmap.
Remove or rewrite anything that still references:

- old `ohlcv_*` schemas
- `minute_index` / `second_index` query models
- nonexistent API layers
- unrelated backtesting experiments inside this app
- outdated roadmap assumptions beyond `1m@1s` and `1h@1m`
