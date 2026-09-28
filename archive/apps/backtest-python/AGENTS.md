# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# `backtest-python`

Python research app inside the monorepo. Reads canonical TimescaleDB candle
tables produced by `apps/write-node` and writes derived feature, model, and
backtest tables.

## Boundary contract

Reads (canonical, owned by `write-node`):

- `candles_1m_1s`
- `candles_1h_1m`
- `candles_1d_1h`

Writes (downstream, owned by this app):

- `features_v1` — long-format feature timeseries keyed by `(ticker, timeframe, feature, time)`
- `models` — model registry
- `backtests` — backtest run summaries
- `predictions` — model predictions per `(model_id, ticker, time)`

Schema for these tables lives in `@lib/db-timescale/migrations/`. Do not
create or alter tables outside that package. `db:verify` enforces the full
table list (canonical + downstream) and the hypertable / index allowlists.

## Source layout

```
src/backtest/
  config.py              # tickers, timeframes, registries
  db/                    # connection + readers/writers
    candles.py           # read canonical candles (1m_1s/1h_1m/1d_1h)
    features.py          # upsert/read features_v1
    models.py            # register_model / get_model
    backtests.py         # record_backtest (append-only)
    predictions.py       # upsert_predictions / read_predictions
  features/
    rsi.py               # Wilder RSI (causal, unit-tested)
    registry.py          # name-resolved FeatureSpec registry
    builder.py           # read_candles -> compute -> upsert orchestration
  backtest/              # walk-forward engine, strategy, metrics (Phase 3)
  models/                # ML training/eval wrappers (Phase 4)
  cli.py                 # entry point
notebooks/               # research notebooks
tests/                   # pytest suite (no DB required)
```

## Operational rules

- Use `uv` (preferred) or `pip` with a pinned `requirements.txt` for env
  management. Do not invent ad hoc venvs.
- Python 3.11+.
- Never write to canonical tables. Only read from them.
- All DB writes go through `db/` modules so types and schemas stay consistent.
- All ML splits must be **time-based**. No random shuffling on timeseries.
- Features must use only data available at the row's `time` (no look-ahead).
- Every backtest and training run must record inputs (data range, params,
  feature versions) into the `backtests` / `models` tables.
- Register new features in `features/registry.py` so they have stable names
  in `features_v1.feature`.

## Useful entry points

Phase 2 (shipped):

```bash
uv run python -m backtest.cli read-candles --ticker ES --timeframe 1m_1s --limit 100

# Multi-period RSI in one invocation: repeat --period for each.
uv run python -m backtest.cli build-features rsi \
  --ticker ES --timeframe 1h_1m \
  --period 7 --period 14 --period 28 \
  --start 2026-01-01 --end 2026-04-01

uv run python -m backtest.cli read-features \
  --ticker ES --timeframe 1h_1m --feature rsi_14 --limit 10
```

Phase 3 / 4 (placeholders, not yet implemented):

```bash
uv run python -m backtest.cli train --model gbm --range 2026-01-01:2026-04-01
uv run python -m backtest.cli backtest --strategy rsi_cvd --ticker ES --range 2026-01-01:2026-04-01
```

## Related docs

- `docs/project/roadmap.md` — phased plan across all apps
- `docs/project/backtest-python.md` — full plan and architecture for this app
- `apps/write-node/AGENTS.md` — canonical writer contract
