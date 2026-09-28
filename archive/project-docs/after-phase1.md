Phase 1 of the roadmap is now code-complete. Here's what shipped, what I improved while reviewing, and what comes next.

## Phase 1 deliverables (write-node — canonical writer)

### New canonical layer: `candles_1d_1h`

End-to-end implementation following the same rolling-window pattern as `1h@1m`:

- **Migration** `lib/db-timescale/migrations/202605061830__add_candles_1d_1h.sql` — same column shape as `candles_1h_1m`, hypertable chunks at 6 months, compression policy `compress_after => 6 months`. Idempotent (`IF NOT EXISTS`, `if_not_exists => TRUE`).
- **Schema artifacts updated to match:**
  - `lib/db-timescale/schema/current.sql` — added the table, primary key, and time-desc index in alphabetical order to mirror what `pg_dump` would output.
  - `lib/db-timescale/generated/typescript/db-types.ts` — new `Candles1d1hRow` interface and updated `TimescaleDbSchema`.
  - `lib/db-timescale/generated/contracts/db-schema.json` — same row contract in JSON.
  - `lib/db-timescale/scripts/verify-contract.mjs` — now enforces `candles_1d_1h` table, `idx_candles_1d_1h_time_desc` index, and the hypertable. Switched index/hypertable checks to parameterised `ANY($1::text[])` so the list stays single-source.
- **Live aggregator** `apps/write-node/src/stream/candles-1d-1h-aggregator.ts` — mirrors `Candles1h1mAggregator` (hydrate from canonical source, reconcile newer rows, replay buffered, write). Uses `RollingCandleWindow` with `windowSize=24, expectedIntervalMs=3_600_000`.
- **Historical script** `apps/write-node/scripts/candles-1d-1h.ts` — paginated read of hour-boundary rows from `candles_1h_1m`, fed through the same engine. Exposed as `pnpm --filter write-node historical:1d1h --truncate`.
- **Live wiring** in `Candles1h1mAggregator`:
  - Constructor now instantiates a `Candles1d1hAggregator` by default. Tests can opt out with `dailyAggregator: null`.
  - `flushPendingCandles` collects successfully-written hour candles and forwards them to the daily aggregator. Failures and requeues stay isolated to their own layer — daily only sees rows that actually landed.
  - `flushCompleted` / `flushAll` cascade down to the daily layer.
- **New shared helper** `isHourBoundary(timestamp)` in `apps/write-node/src/lib/trade/timestamp.ts`, exported from `lib/trade/index.ts`. The daily aggregator uses it to filter the minute-cadence input down to hour-boundary rows.
- **Tests:** new `candles-1d-1h-aggregator.test.ts` covering warmup-then-emit and hour-boundary filtering. Existing 1h tests updated to opt out of the auto-attached daily aggregator (`dailyAggregator: null`) so they don't pull mock queries into the daily code path. **18/18 tests pass cleanly with no console noise.**

### `/api/v1/stats` ops endpoint

- New `getAggregatorSnapshot()` in `apps/write-node/src/stream/tbbo-stream.ts` exposes a read-only view of the live aggregator state.
- New `Tbbo1mAggregator.getTickerSnapshots()` accessor surfaces the underlying `RollingWindow1m.getTickerSnapshots()` (warmup progress, ring size, current CVD).
- `apps/write-node/src/index.ts` now serves `GET /api/v1/stats` returning `{ stream: { status, counters }, aggregator: { stats, tickers } }`. No DB query required, so it's safe to hit aggressively from monitors.

### Backfill runbook

`apps/write-node/docs/backfill.md` — full end-to-end playbook:

- Prerequisites (DB migrate, Databento access).
- TBBO download via the Databento CLI with the right dataset/stype/symbols.
- Three-stage backfill: `historical:tbbo` → `historical:1h1m --truncate` → `historical:1d1h --truncate`.
- Continuity-check SQL for row counts per day, CVD continuity, and layer alignment.
- Live writer monitoring via `/api/v1/stats`.
- Common pitfalls (mixed datasets, partial truncation breaking CVD anchors).

## Review of Phase 0 changes I revisited

- The `apps/backtest-python` scaffold and the three project docs from the previous session are untouched and still align with the roadmap. The roadmap now references the new daily layer as shipped rather than planned.
- `LARGE_TRADE_THRESHOLDS` already had SI/HG entries from the previous session.
- The `Candles1h1mAggregator` and `RollingCandleWindow` patterns generalized cleanly to 24-hour windows with no engine changes — confirming the "build N+1 timeframe from boundary rows of layer N" design.

## Build / test status

- `pnpm build` (full monorepo): all 4 apps green.
- `pnpm --filter write-node build` (`tsc --noEmit`): clean.
- write-node tests via `tsx --test`: **18/18 passing.**
- Linter: no issues in any touched file.

## Plan + roadmap updates

- **`docs/project/roadmap.md`** — replaced the "planned tables" section with a single shipped/status table; renamed Phase 1 to "code-complete" with the remaining ops items spelled out; renamed Phase 2 to "current focus".
- **`docs/project/write-node-completion.md`** — rewritten as a status doc. Each Phase 1 deliverable is documented with what shipped (multi-ticker thresholds, daily timeframe, stats endpoint, backfill runbook) and the four operational tasks that remain (production env config, apply migration, run full backfill, verify warmup).
- **`apps/write-node/AGENTS.md`** — promoted `candles_1d_1h` from "planned" to "shipped" in the runtime architecture, scope description, source layout, and developer rules. Added explicit `1d@1h` derivation rule.
- **`apps/write-node/README.md`** — added `historical:1d1h` to the historical rebuild section and pointer to `docs/backfill.md`.
- **`apps/write-node/docs/index.md`** — added the daily layer and backfill runbook to the kept-docs list.

## Phase 1 — remaining (operational only)

These don't require code changes. They're tracked in `docs/project/write-node-completion.md`:

1. Set production `DATABENTO_SYMBOLS=ES.FUT,NQ.FUT,GC.FUT,SI.FUT,HG.FUT,CL.FUT`.
2. Run `pnpm --filter @lib/db-timescale db:migrate && db:verify` against the deployed Timescale to apply the new `candles_1d_1h` migration.
3. Run the full backfill per `apps/write-node/docs/backfill.md`.
4. Hit `/api/v1/stats` to confirm every configured ticker reports warmup complete.

## Next phase (Phase 2 — `backtest-python`)

The roadmap now lists this as the current focus. Concrete first PR-sized tasks, in order:

1. Bootstrap the Python env (`uv venv && uv sync` in `apps/backtest-python`) and validate `python -m backtest.cli read-candles --ticker ES --timeframe 1m_1s --limit 5` against the dev DB.
2. Add migrations for `features_v1`, `models`, `backtests`, and `predictions` to `@lib/db-timescale/migrations/` (schemas already sketched in `docs/project/backtest-python.md`). Re-run `db:verify` and add these tables to the verify allowlist.
3. Implement `db/features.py` writer for `features_v1` (long-format upsert keyed by `(ticker, timeframe, feature, time)`).
4. Implement multi-timeframe RSI builder: `python -m backtest.cli build-features rsi --ticker ES --timeframe {1m_1s|1h_1m|1d_1h} --period 14 --start … --end …`. The `wilder_rsi` function is already in place with a passing test.
5. Notebook `01_explore_canonical.ipynb` to sanity-check joined price + RSI on each timeframe for ES.

Once those land, Phase 3 (walk-forward backtest engine) becomes a clean follow-on because all three canonical layers are now stable and queryable through the same uniform schema.
