# Project roadmap

End goal: an effective day-trading research and backtest framework using
multi-timeframe rolling-window candles, structural order-flow metrics (CVD,
VD), multi-timeframe RSI, and machine-learning models trained on the resulting
feature set.

The repo is organized so each layer has one job and a hard contract with the
next:

```
Databento TBBO trades
        │
        ▼
   write-node           (TypeScript, monorepo)
        │
        ▼
   TimescaleDB          (canonical candle tables)
        │
        ▼
   backtest-python      (Python, monorepo)
        │
        ▼
   feature/model tables (TimescaleDB)
        │
        ▼
   view-next            (Next.js dashboards)
```

## Rolling-window interval aggregation

The defining design idea of this repo:

> Each stored row is a **trailing rolling window** of length T, written at a
> finer cadence C. So `candles_1m_1s` is the trailing 60 seconds **written
> every second**, not a 1-minute bar that appears once per minute.

Properties:

- 60x more rows per timeframe than traditional candles (richer ML training
  data, better signal localization).
- Every higher timeframe is built from boundary rows of the lower timeframe
  (deterministic, no double aggregation).
- Stored additive accumulators (`sum_price_volume`, `sum_bid_depth`,
  `sum_ask_depth`, `unknown_volume`) let higher timeframes recompute derived
  metrics correctly from raw aggregated fields.

Canonical tables:

| Table             | Window | Cadence | Source                                  | Status      |
| ----------------- | ------ | ------- | --------------------------------------- | ----------- |
| `candles_1m_1s`   | 60s    | 1s      | TBBO trades (front-month stitched)      | shipped     |
| `candles_1h_1m`   | 60m    | 1m      | minute-boundary rows of `candles_1m_1s` | shipped     |
| `candles_1d_1h`   | 24h    | 1h      | hour-boundary rows of `candles_1h_1m`   | shipped     |
| `candles_1s_1s`   | 1s     | 1s      | optional pure 1-second bars             | not planned |

## Tickers in scope

Initial coverage (CME futures, front-month stitched):

| Ticker | Market               | Session profile |
| ------ | -------------------- | --------------- |
| ES     | E-mini S&P 500       | globex          |
| NQ     | E-mini Nasdaq-100    | globex          |
| GC     | Gold                 | globex          |
| SI     | Silver               | globex          |
| HG     | Copper               | globex          |
| CL     | WTI Crude            | globex          |

`SESSION_PROFILE_BY_TICKER` and `LARGE_TRADE_THRESHOLDS` already cover most of
these; remaining work is operational (env config, backfill orchestration).

## Phases

### Phase 1 — Finish canonical writer (write-node) — code-complete

All code, schema, and docs work for this phase has shipped. See
[write-node-completion.md](./write-node-completion.md) for the detailed
status per item. Remaining work in this phase is operational only:

- Production env config (`DATABENTO_SYMBOLS`) for the full ticker set.
- Backfill the canonical history per [`apps/write-node/docs/backfill.md`](../../apps/write-node/docs/backfill.md).
- Confirm `/api/v1/stats` shows all configured tickers warmed up live.

Phase 1 exit criteria (unchanged): clean canonical history exists for ES, NQ,
GC, SI, HG, CL across 1m@1s, 1h@1m, 1d@1h, with continuous CVD and stable
rolling stats.

### Phase 2 — Scaffold backtest-python — code-complete

See [backtest-python.md](./backtest-python.md) for full detail and
implementation status.

What shipped:

- Python app bootstrapped (`uv` + `pyproject.toml`, ruff lint clean,
  `pytest` green, Python 3.11+).
- Read-only candle client (`backtest.db.candles.read_candles`) that loads any
  of the three canonical timeframes into pandas DataFrames indexed by `time`.
- Long-format feature store: new migration adds `features_v1`, `models`,
  `backtests`, and `predictions` tables in `@lib/db-timescale`. `features_v1`
  and `predictions` are hypertables with compression policies. `db:verify`
  enforces the new tables, indexes, and hypertable configuration.
- Feature registry + builder pipeline: `backtest.features.registry` maps
  stable names (`rsi_7`, `rsi_14`, `rsi_28`) to causal builder functions, and
  `backtest.features.builder` orchestrates `read_candles → compute → upsert`.
- CLI commands: `read-candles`, `build-features rsi`, `read-features`,
  with `train` / `backtest` placeholders kept for Phase 3.
- Notebook `01_explore_canonical.ipynb` joins canonical price + multi-period
  RSI per timeframe for sanity-checking new ranges.

Database additions are documented in
[`backtest-python.md`](./backtest-python.md). All four downstream tables
follow the same database-first contract as canonical tables.

Phase 2 exit criteria, met:

- A Python script reads 1m/1h/1d candles for any ticker and writes
  multi-timeframe RSI(7), RSI(14), RSI(28) into `features_v1`.
- `pnpm build`, `pnpm --filter @lib/db-timescale db:verify`, and the Python
  test suite are all green.

### Phase 3 — Backtesting engine — current focus

Builds on the canonical candles (Phase 1) and `features_v1` (Phase 2). All
new code lives under `apps/backtest-python/src/backtest/backtest/`.

1. Strategy interface (`signals(df) -> {-1, 0, +1}`) plus a registry of
   built-in strategies. First strategy: RSI(14) on 1h crossing up through 30
   while CVD slope on 1h is rising.
2. Walk-forward evaluation with **time-based** train/validation/test split.
   No random shuffling. Add an embargo gap when overlapping forward labels
   exist between train and test periods.
3. Realistic execution model: per-ticker slippage (in ticks) and commission
   (per round trip). Default to "next bar open" fills with conservative
   slippage; allow overrides per-strategy or per-backtest.
4. Metrics: Sharpe, Sortino, max drawdown, hit rate, expectancy, exposure,
   profit factor, time-in-market.
5. Backtest results persisted to `public.backtests` (already migrated in
   Phase 2). One row per run captures the strategy, params, range, and
   metrics so runs are reproducible.
6. Optional `view-next` dashboard tab to list recent backtests with metric
   tiles and an equity curve. Read-only consumer of `public.backtests`.

Exit criteria: at least one baseline rules-based strategy (e.g. CVD
divergence + multi-timeframe RSI) is fully backtested across all in-scope
tickers with reproducible metrics, walk-forward validation, and persisted
results.

### Phase 4 — Machine learning

1. Feature engineering pipeline: multi-timeframe candles + multi-period
   indicators + structural metrics -> tabular feature vectors keyed by
   `(ticker, time)`.
2. Label generation: forward-return targets, classification labels, or
   risk-adjusted PnL labels.
3. Baseline models: gradient-boosted trees (LightGBM/XGBoost) for tabular
   data, then optionally sequence models (LSTM/Transformer) once tabular
   baselines are honest.
4. Train/validation/test split must be **time-based**, never random.
5. Live inference path: same feature pipeline runs against the latest
   canonical rows and writes predictions to a `predictions` table.

Exit criteria: at least one model produces predictions that beat a documented
baseline (random / always-flat / EMA crossover) on out-of-sample data with
reproducible artifacts.

### Phase 5 — Live signal & risk loop (out of immediate scope)

- Position sizing rules.
- Risk caps (per-ticker, per-day, per-strategy).
- Alerting and human-in-the-loop confirmation.
- Optional broker integration.

This phase intentionally lives outside the current research apps. It should be
a separate service that consumes the `predictions` table, not a write-node or
backtest-python responsibility.

## Cross-cutting principles

- **Database-first.** Schema changes go through `@lib/db-timescale` migrations.
  Never alter tables outside migrations.
- **Forward-only migrations.** Never edit an applied migration.
- **Determinism.** Live and historical paths must produce identical canonical
  rows for the same input data. Shared library code over duplicated logic.
- **Time-based splits.** No random shuffling for ML on timeseries.
- **Reproducibility.** Every backtest and model run records inputs, params,
  data range, and metrics so it can be repeated.
- **No leaks.** Features must use only data available at the row's `time`.
  Forward-looking labels are fine; forward-looking features are not.

## Operating model

Today this is a personal research project, not a SaaS. The "business plan" is
the research roadmap above plus a small set of operational habits:

- Run `write-node` continuously in a managed environment (Railway today) so
  canonical data accumulates day over day.
- Run `backtest-python` on a development machine for research, and as a
  scheduled job for nightly feature/backtest refresh once the pipeline is
  stable.
- Treat canonical TimescaleDB tables as the durable asset. Apps are
  recoverable; canonical data is harder to recreate cheaply (Databento costs).
- Keep all derived features and models in TimescaleDB so any client (notebook,
  view-next, future service) reads from one source of truth.
