# `apps/backtest-python` — Phase 2 status + Phase 3 plan

A Python research app inside the monorepo that reads canonical TimescaleDB
candle tables, builds derived features (multi-timeframe RSI, CVD slope, etc.),
trains and evaluates ML models, and runs backtests.

**Phase 2 (scaffold + first feature) is code-complete.** This document keeps
the original architecture as a reference and documents what shipped vs. what
remains for Phases 3+.

## Why Python here

- Tabular ML tooling (scikit-learn, LightGBM, XGBoost, statsmodels) is best in
  Python.
- pandas/polars + numpy are the standard for timeseries feature engineering.
- Jupyter notebooks are the natural environment for research workflows.
- TypeScript apps in this repo continue to own runtime ingest and UI; they do
  not need to do heavy numerical work.

## Boundary contract

`backtest-python` only **reads** from canonical tables produced by
`write-node`:

- `candles_1m_1s`
- `candles_1h_1m`
- `candles_1d_1h`

`backtest-python` **writes** its own tables, never the canonical ones:

- `features_v1` — derived feature timeseries
- `models` — model registry (params, metrics, artifact location)
- `backtests` — backtest run summaries
- `predictions` — model predictions per `(ticker, time)` for live inference

Schema for these tables lives in `@lib/db-timescale/migrations/` so it stays
under the same database-first contract as the canonical tables.

## Suggested layout

```
apps/backtest-python/
  AGENTS.md
  README.md
  pyproject.toml
  .python-version
  .gitignore
  src/backtest/
    __init__.py
    config.py              # tickers, timeframes, registries
    db/
      __init__.py
      connection.py        # asyncpg / psycopg pool
      candles.py           # readers for canonical tables
      features.py          # writers for features_v1
      models.py            # readers/writers for models registry
      backtests.py         # readers/writers for backtests
      predictions.py       # readers/writers for predictions
    features/
      __init__.py
      registry.py
      rsi.py               # multi-timeframe RSI
      cvd.py               # CVD-derived features
      returns.py           # rolling/forward returns, vol
      multitimeframe.py    # alignment helpers across 1m/1h/1d
    backtest/
      __init__.py
      engine.py            # walk-forward loop
      strategy.py          # Strategy interface
      portfolio.py         # position sizing, fills, slippage
      metrics.py           # Sharpe, Sortino, max DD, etc.
    models/
      __init__.py
      base.py              # train/predict interface
      gbm.py               # LightGBM/XGBoost wrappers
      labels.py            # forward-return labels
      eval.py              # OOS evaluation utilities
    cli.py                 # typer-based command entry points
  notebooks/
    01_explore_canonical.ipynb
    02_features_rsi.ipynb
    03_baseline_strategy.ipynb
    04_train_gbm.ipynb
  tests/
    test_features_rsi.py
    test_engine.py
```

## Tooling

- Python 3.11+
- `uv` for dependency and venv management (fast, reproducible). `pip` works
  but `uv` is preferred.
- `ruff` for lint/format. `pytest` for tests.
- DB driver: `psycopg[binary,pool]` (sync, simpler) or `asyncpg` (async).
  Recommend `psycopg` for research since notebooks are sync-heavy.
- Numerical: `pandas`, `polars`, `numpy`.
- ML: `scikit-learn`, `lightgbm`, `xgboost`. Optional later: `pytorch`.
- Plotting: `matplotlib`. Notebook: `jupyterlab`.

## Database additions

Shipped in `lib/db-timescale/migrations/202605072300__add_backtest_python_tables.sql`.
The four downstream tables are now part of the same database-first contract
as the canonical tables. `db:verify` enforces both.

### `features_v1`

Long-format feature table keyed by ticker, time, timeframe, feature name. Long
format keeps the writer simple and lets new features be added without
migrations.

```sql
CREATE TABLE IF NOT EXISTS public.features_v1 (
  "time"     TIMESTAMPTZ  NOT NULL,
  ticker     TEXT         NOT NULL,
  timeframe  TEXT         NOT NULL,        -- '1m_1s' | '1h_1m' | '1d_1h'
  feature    TEXT         NOT NULL,        -- e.g. 'rsi_14'
  value      DOUBLE PRECISION,
  CONSTRAINT features_v1_pkey
    PRIMARY KEY (ticker, timeframe, feature, "time")
);

SELECT create_hypertable(
  'public.features_v1',
  by_range('time', INTERVAL '1 month'),
  if_not_exists => TRUE,
  create_default_indexes => FALSE
);

ALTER TABLE public.features_v1 SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'ticker, timeframe, feature',
  timescaledb.compress_orderby = 'time DESC'
);
```

### `models`

```sql
CREATE TABLE IF NOT EXISTS public.models (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  version       TEXT NOT NULL,
  params        JSONB NOT NULL,
  metrics       JSONB NOT NULL,
  artifact_uri  TEXT,                      -- e.g. file://, s3://
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, version)
);
```

### `backtests`

```sql
CREATE TABLE IF NOT EXISTS public.backtests (
  id            BIGSERIAL PRIMARY KEY,
  model_id      BIGINT REFERENCES public.models(id),
  strategy      TEXT NOT NULL,
  ticker        TEXT NOT NULL,
  range_start   TIMESTAMPTZ NOT NULL,
  range_end     TIMESTAMPTZ NOT NULL,
  params        JSONB NOT NULL,
  metrics       JSONB NOT NULL,            -- Sharpe, Sortino, max_dd, etc.
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `predictions`

```sql
CREATE TABLE IF NOT EXISTS public.predictions (
  "time"      TIMESTAMPTZ NOT NULL,
  ticker      TEXT NOT NULL,
  model_id    BIGINT NOT NULL REFERENCES public.models(id),
  prediction  DOUBLE PRECISION NOT NULL,
  label       DOUBLE PRECISION,            -- nullable until forward window closes
  CONSTRAINT predictions_pkey PRIMARY KEY (model_id, ticker, "time")
);

SELECT create_hypertable(
  'public.predictions',
  by_range('time', INTERVAL '1 month'),
  if_not_exists => TRUE,
  create_default_indexes => FALSE
);
```

## Phase 2 status

### Step 1 — Bootstrap the app — done

- `apps/backtest-python/` skeleton: `pyproject.toml`, `AGENTS.md`, `README.md`,
  `src/backtest/`, `notebooks/`, `tests/`.
- `uv` venv + `uv pip install -e ".[dev]"` works end-to-end. `.python-version`
  pins the interpreter.
- `cli.py` exposes `read-candles`, `build-features rsi`, `read-features`,
  with `train` / `backtest` placeholders for later phases.

### Step 2 — Read canonical candles — done

- `db/connection.py` opens a pooled `psycopg` connection via
  `TIMESCALE_DB_URL`.
- `db/candles.py::read_candles(ticker, timeframe, start, end, columns, limit)`
  returns a DataFrame for any of the three canonical layers
  (`1m_1s`, `1h_1m`, `1d_1h`).
- Notebook `notebooks/01_explore_canonical.ipynb` reads all three timeframes
  for one ticker, summarises row counts and CVD endpoints, and plots
  price + RSI(14) per timeframe.

Validation gates that should be checked when a fresh range is loaded:

- No timestamp gaps inside open-market windows.
- CVD changes by per-second VD, never jumps.
- Row count per day matches expected open-market seconds.

### Step 3 — Multi-timeframe RSI — done

- `features/rsi.py::wilder_rsi(close, period)` is vectorized, causal, and
  unit-tested for bounds and warmup behaviour.
- `features/registry.py` resolves stable feature names (`rsi_7`, `rsi_14`,
  `rsi_28`) to `FeatureSpec`s. New features register here, not in migrations.
- `features/builder.py::build_and_write_features(...)` reads canonical
  candles, computes each spec's series, drops NaN warmup rows, and UPSERTS
  the result into `features_v1`. Pure `compute_feature_series(...)` is
  available for notebooks/tests with no DB.
- `db/features.py` provides `upsert_features`, `upsert_feature_series`,
  `read_features` (long), and `read_features_wide` (pivoted) helpers.
- CLI:
  ```bash
  uv run python -m backtest.cli build-features rsi \
    --ticker ES --timeframe 1h_1m \
    --period 7 --period 14 --period 28 \
    --start 2026-01-01 --end 2026-04-01
  ```
- Multi-timeframe RSI is the union of `(rsi_7, rsi_14, rsi_28)` written
  independently for each canonical timeframe — no cross-timeframe code; the
  feature vector layer in Phase 3 joins them by `(ticker, time)`.

## Phase 3 plan

### Step 4 — Strategy interface and a baseline backtest

- `backtest/strategy.py` defines:
  ```python
  class Strategy(Protocol):
      def signals(self, df: pd.DataFrame) -> pd.Series: ...   # -1/0/+1
  ```
- `backtest/engine.py` runs walk-forward with explicit slippage and commission.
- `backtest/metrics.py` returns Sharpe, Sortino, max DD, hit rate, expectancy,
  exposure.
- Implement a baseline rules-based strategy:
  - Long when RSI(14) on 1h crosses up through 30 **and** CVD slope on 1h is
    rising.
  - Flat otherwise.
- Run on ES across 6 months. Persist result to `backtests`.

### Step 5 — Tabular ML baseline (LightGBM)

- `models/labels.py`: forward N-bar return, sign label, vol-adjusted label.
- Build a feature vector per `(ticker, time)` joining:
  - Price returns at multiple lookbacks.
  - RSI at multiple periods on multiple timeframes.
  - CVD-derived features (slope, Z-score) on multiple timeframes.
  - Book imbalance, divergence, vd_ratio.
- Train LightGBM with **time-based split**: train < t1 < val < t2 < test.
- Evaluate on the held-out test range against:
  - Random baseline.
  - Always-flat baseline.
  - The Step 4 rules-based strategy.
- Persist model to `models`. Persist `predictions` for the test range.
- Run backtest on `predictions` and persist to `backtests`.

### Step 6 — Live inference loop (later)

- Schedule a job (cron or similar) that, every minute or every hour:
  - Reads latest canonical candles.
  - Recomputes the same features for the latest row.
  - Runs the deployed model.
  - Writes a row into `predictions`.
- A simple dashboard in `view-next` reads `predictions` and shows current
  ticker-by-ticker signals with confidence.

## Anti-pitfalls (must read before writing features)

- **No look-ahead leakage.** A feature row at time T may only depend on data
  with `time <= T`. Forward returns are labels, not features.
- **No random shuffling.** All splits must be time-based. K-fold cross
  validation is wrong for timeseries; use expanding-window or rolling-window
  CV.
- **Survivorship bias.** Front-month stitching avoids contract-roll bias, but
  any future filter on universe membership must respect data available at the
  time.
- **Slippage and fees matter.** A backtest without realistic costs is
  decoration. Pick conservative defaults.
- **Reproducibility.** Every backtest and training run records the data range,
  feature versions, hyperparameters, and metrics. No "I think this run was
  better."
- **Compute discipline.** Long backtests should stream from the DB with
  `(ticker, time)` paging, not load everything into memory.

## Open questions to resolve before Step 5

- Trade frequency target: are we targeting 1 trade/day, 1 trade/hour, or pure
  ML scoring with no trade rule? This determines label horizon.
- Capital and leverage assumptions for backtests.
- Slippage model: fixed ticks per fill, or quote-derived from book imbalance.
- Whether to model partial fills or assume full fills at next-bar open.

These can be parameterized; pick defaults early to avoid over-fitting research
to a specific assumption.
