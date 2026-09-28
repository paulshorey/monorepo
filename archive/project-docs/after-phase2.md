Phase 2 is code-complete. Here's the summary.

## Phase 2 deliverables (`backtest-python` — scaffold + first feature)

### New downstream tables (lib/db-timescale)

Single migration `lib/db-timescale/migrations/202605072300__add_backtest_python_tables.sql` adds the four `apps/backtest-python`–owned tables:

- `features_v1` — long-format hypertable keyed by `(ticker, timeframe, feature, "time")`. Monthly chunks; compression segmented by `(ticker, timeframe, feature)`; compress-after 3 months.
- `models` — model registry, `(name, version)` UNIQUE so re-runs are idempotent.
- `backtests` — append-only run log, FK to `models(id)` with `ON DELETE SET NULL`.
- `predictions` — hypertable keyed by `(model_id, ticker, "time")`. UPSERT preserves an existing non-null `label` (so retrospective label fills aren't clobbered by re-running a forward pass).

Updates to keep the database-first contract intact:

- `lib/db-timescale/scripts/generate-types.mjs` — broadened `expectedTables` to include all canonical + downstream tables (it had been stale, missing `candles_1d_1h`).
- `lib/db-timescale/scripts/verify-contract.mjs` — split into `expectedHypertables` and `expectedRegularTables`; added `idx_features_v1_time_desc`, `idx_predictions_time_desc`, `idx_backtests_strategy_ticker` to the index allowlist.
- `lib/db-timescale/schema/current.sql`, `generated/typescript/db-types.ts`, `generated/contracts/db-schema.json` — regenerated from the live dev DB; now include `BacktestsRow`, `FeaturesV1Row`, `ModelsRow`, `PredictionsRow`.
- `lib/db-timescale/queries/{features,predictions,models,backtests}/*.sql` — language-agnostic SQL contracts for the new write paths.
- Migration applied to the dev DB; **`db:verify` passes**.

### Python implementation (`apps/backtest-python`)

- **`db/features.py`** — `upsert_features` (batch UPSERT, NaN-skipping), `upsert_feature_series` (Series → DB convenience), `read_features` (long), `read_features_wide` (pivoted; one column per feature, time index).
- **`db/models.py`** — `register_model(name, version, params, metrics, artifact_uri)` (idempotent via `(name, version)` UNIQUE) and `get_model(...)`.
- **`db/backtests.py`** — `record_backtest(...)` append-only.
- **`db/predictions.py`** — `upsert_predictions` (preserves existing non-null `label`) and `read_predictions`.
- **`db/candles.py`** — switched off `pd.read_sql` to `psycopg.dict_row` cursors; the pandas DBAPI warning is gone.
- **`features/registry.py`** — `FeatureSpec(name, build)` with index-alignment guarantees, plus `rsi_spec(period)`, `default_rsi_specs()` returning `(rsi_7, rsi_14, rsi_28)`, and `resolve("rsi_14")` for name → spec lookup.
- **`features/builder.py`** — `compute_feature_series` is pure (no DB), `build_and_write_features` is the full orchestration: read → compute each spec → drop NaN warmup → UPSERT.
- **`cli.py`** — added `build-features rsi` (multi-period via repeated `--period`) and `read-features` (long preview); kept `train` / `backtest` as Phase 3 placeholders.
- **`pyproject.toml`** — `[tool.ruff.lint.per-file-ignores]` allows `B008` in the typer CLI module.

### Tests + notebook

- `tests/test_rsi.py` (existing, passes) — bounds and warmup.
- `tests/test_registry.py` — name/index alignment, default periods, unknown-feature rejection, alignment guard.
- `tests/test_builder.py` — pure compute, NaN-skip, empty-input no-op, multi-spec ordering. **All run without a DB** by patching `backtest.db.features.upsert_feature_series`.
- `notebooks/01_explore_canonical.ipynb` — pulls the three canonical timeframes for one ticker, summarises row counts and CVD endpoints, computes `rsi_7/14/28` per timeframe, and plots price + RSI side by side.

### Live verification against dev Timescale

- `pnpm --filter @lib/db-timescale db:migrate` applied the new migration cleanly.
- `pnpm --filter @lib/db-timescale db:verify` passes (table allowlist + index allowlist + hypertable allowlist + generated artifact reproducibility).
- End-to-end smoke (synthetic feature series): wrote 20 rows, read 20 back via `read_features_wide`, then deleted them.

### Build / test status

- `pnpm build` — all 4 TS apps green.
- `pnpm --filter write-node` tests — **18/18 passing.**
- Python: `ruff check` clean. `pytest -q` — **12/12 passing.**

### Plan + roadmap updates

- **`docs/project/roadmap.md`** — Phase 2 renamed to "code-complete" with the shipped list, exit criteria marked met. Phase 3 promoted to "current focus" with concrete first PR-sized tasks (strategy interface, walk-forward with embargo gap, slippage/commission, persisted metrics in `public.backtests`).
- **`docs/project/backtest-python.md`** — split into "Phase 2 status" (Steps 1–3 marked done with what shipped) and "Phase 3 plan" (Steps 4 onward unchanged).
- **`apps/backtest-python/AGENTS.md`** — promoted `candles_1d_1h` from "(planned)" to a normal read source; documented the actual source-tree layout including `db/`, `features/registry.py`, `features/builder.py`; refreshed the entry-point examples to match the shipped CLI.
- **`apps/backtest-python/README.md`** — replaced the stub status table with an accurate one (Phase 2 areas marked shipped, Phase 3/4 marked next/later); updated quick-start with the actual `uv pip install -e ".[dev]"` flow plus working `build-features rsi` and `read-features` invocations.
- **`lib/db-timescale/README.md`** — "Current scope" now lists canonical and downstream tables and notes that `db:verify` enforces both allowlists.

## Phase 2 — remaining (operational only)

These don't require code changes:

1. Apply the new migration to any non-dev Timescale (run `pnpm --filter @lib/db-timescale db:migrate && db:verify`).
2. Run `pnpm --filter backtest python -m backtest.cli build-features rsi …` to populate `features_v1` for each in-scope ticker × timeframe across the existing canonical history. The CLI is idempotent on repeat runs.

## Next phase (Phase 3 — backtest engine)

The roadmap now lists this as the current focus. Concrete first PR-sized tasks, in order:

1. `backtest/strategy.py` — `Strategy` Protocol with `signals(df) -> pd.Series` returning `{-1, 0, +1}`, plus a small registry pattern mirroring `features/registry.py`.
2. `backtest/portfolio.py` — execution model: per-ticker slippage in ticks, commission per round trip, "next-bar open" fills as the conservative default.
3. `backtest/engine.py` — walk-forward loop with **time-based** train/val/test split and an **embargo gap** when overlapping forward labels exist. No random shuffling.
4. `backtest/metrics.py` — Sharpe, Sortino, max DD, hit rate, expectancy, exposure, profit factor, time-in-market.
5. First baseline strategy: long when `rsi_14` on 1h crosses up through 30 **and** CVD slope on 1h is rising; flat otherwise. Run across the in-scope tickers, persist each run to `public.backtests` via `db.backtests.record_backtest`.
6. Optional `view-next` panel to read `public.backtests` and render an equity curve + metric tiles per run.

All Phase 3 work reads only from `candles_*` and `features_v1`, and writes only to `backtests` — schema is already in place, so the engine can be built without touching `@lib/db-timescale` again.
