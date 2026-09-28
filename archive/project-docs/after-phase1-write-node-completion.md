# Finishing `write-node`

Phase 1 of the [project roadmap](./roadmap.md). Code-complete; remaining work
is operational.

## Status today

Already implemented and working:

- TBBO ingest (Databento live TCP + historical JSONL files).
- Front-month stitching across contract roll boundaries.
- Per-ticker market session calendar (Globex + Tokyo daytime starter set).
- Per-row metrics: OHLCV, CVD OHLC, VD, vd_ratio, book_imbalance, price_pct
  (basis points), divergence, trades, max_trade_size, big_trades, big_volume.
- Additive accumulators: sum_price_volume, sum_bid_depth, sum_ask_depth,
  unknown_volume.
- Three canonical tables: `candles_1m_1s`, `candles_1h_1m`, `candles_1d_1h`.
- Tests covering aggregator behaviour and rolling-session continuity.
- Live stream forwards `1m → 1h → 1d` deterministically through shared
  rolling-window code.

## What shipped in this phase

### 1. Multi-ticker thresholds — done

`SI` and `HG` added to `LARGE_TRADE_THRESHOLDS` in
`apps/write-node/src/lib/trade/thresholds.ts`. Together with the existing
`SESSION_PROFILE_BY_TICKER` entries, the writer now supports:

ES, NQ, RTY, YM, CL, GC, SI, HG, NG (Globex), NK (Tokyo).

Adding a new ticker now requires only:

- entry in `SESSION_PROFILE_BY_TICKER`
- entry in `LARGE_TRADE_THRESHOLDS` (or fallback to `DEFAULT`)
- inclusion in the live `DATABENTO_SYMBOLS` env var

### 2. Daily timeframe `candles_1d_1h` — done

- Migration: `lib/db-timescale/migrations/202605061830__add_candles_1d_1h.sql`
  (table + 6-month hypertable + 6-month compression policy).
- Schema snapshot, generated TypeScript row type, and JSON contract artifact
  updated to include the new table.
- `db:verify` now enforces the `candles_1d_1h` table, index, and hypertable.
- New `RollingCandleWindow` instance with `windowSize=24`,
  `expectedIntervalMs=3_600_000`, label `1d@1h`. Same engine as `1h@1m`.
- New live aggregator `apps/write-node/src/stream/candles-1d-1h-aggregator.ts`
  mirroring the `Candles1h1mAggregator` pattern: hydrate, reconcile, replay
  buffered, write.
- New historical rebuild script
  `apps/write-node/scripts/candles-1d-1h.ts` and
  `pnpm --filter write-node historical:1d1h --truncate`.
- Live wiring: `Candles1h1mAggregator` instantiates a `Candles1d1hAggregator`
  by default and forwards successfully-written hour rows to it on every
  flush. Tests can opt out with `dailyAggregator: null`.
- New tests in `candles-1d-1h-aggregator.test.ts` covering warmup-then-emit
  and hour-boundary filtering.

### 3. Operational stats endpoint — done

- `GET /api/v1/stats` on the write-node HTTP server returns:
  - `stream.status` — connected / authenticated / streaming / reconnect attempts
  - `stream.counters` — message counts, skip counts, market-open by ticker
  - `aggregator.stats` — records processed, candles written, late/unknown
    counts, gap resets, CVD by ticker
  - `aggregator.tickers` — per-ticker rolling window state (warmup progress,
    ring size, current CVD)
- Reuses the existing `Tbbo1mAggregator.getStats()` plus a new
  `getTickerSnapshots()` accessor exposing the underlying `RollingWindow1m`
  ticker snapshots through the live module.

### 4. Backfill runbook — done

`apps/write-node/docs/backfill.md` is the end-to-end runbook covering:

- prerequisites (DB migrations applied, Databento access)
- TBBO download via the Databento CLI
- `historical:tbbo` for `candles_1m_1s`
- `historical:1h1m --truncate` for `candles_1h_1m`
- `historical:1d1h --truncate` for `candles_1d_1h`
- continuity checks (row counts, CVD continuity, layer alignment)
- live writer monitoring via `/api/v1/stats`
- common backfill pitfalls

## Remaining work in this phase (operational)

These are config/ops tasks, not code:

1. **Live env config in production.** Set the production `DATABENTO_SYMBOLS`
   to the full in-scope list, e.g.:
   `ES.FUT,NQ.FUT,GC.FUT,SI.FUT,HG.FUT,CL.FUT`.
2. **Apply the new migration to the dev DB.** Run
   `pnpm --filter @lib/db-timescale db:migrate` followed by `db:verify` against
   the deployed Timescale to add `candles_1d_1h` (the new migration file is
   forward-only and idempotent).
3. **Run the full backfill.** Follow
   [`backfill.md`](../../apps/write-node/docs/backfill.md) for the in-scope
   tickers across the desired date range.
4. **Confirm warmup live.** Hit `/api/v1/stats` after a few minutes of live
   streaming; every configured ticker should report warmup complete and a
   ring size matching the windowSeconds for its layer.

Phase 1 exit criteria (unchanged): clean canonical history for ES, NQ, GC,
SI, HG, CL across 1m@1s, 1h@1m, 1d@1h with continuous CVD and stable rolling
stats.

## Optional future polish (not on the critical path)

- **Per-ticker holiday overrides** on top of the weekly session calendar.
- **Configurable per-ticker large-trade thresholds** via env or config file.
- **Persisted aggregator stats snapshot table** so stats are queryable
  historically, not only via the live `/api/v1/stats` endpoint.
- **Replay tooling** that re-runs a date range and diffs against the existing
  table to verify determinism after engine changes.
- **Pure 1-second candles (`candles_1s_1s`)** — explicitly out of scope. The
  per-second cadence is already stored implicitly in `candles_1m_1s`; downstream
  code can extract per-second snapshots from those rows when needed.

## Roadmap items intentionally NOT in write-node

Do not add these to `write-node`:

- RSI / MACD / Bollinger / multi-period indicators.
- Multi-period CVD slope / Z-score / vol-adjusted features.
- ML feature tables, model registry, predictions.
- Any model training or inference logic.

These belong in `apps/backtest-python`. See
[`docs/project/backtest-python.md`](./backtest-python.md).
