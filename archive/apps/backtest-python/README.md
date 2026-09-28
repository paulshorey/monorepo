# ARCHIVED — backtest-python

Retired experiment. Do not deploy or use as an active dependency. See the root README and docs/project/reuse-review.md.

# backtest-python

Python research app for downstream feature engineering, ML training, and
backtesting on top of canonical candle tables produced by
[`apps/write-node`](../write-node/README.md).

Phase 2 (scaffold + first feature) is code-complete. See
[`docs/project/backtest-python.md`](../../docs/project/backtest-python.md) for
the full status and the Phase 3 backtest-engine plan.

## What this app does

Today (Phase 2):

- Reads canonical candles from TimescaleDB:
  - `candles_1m_1s` — rolling 60-second window written every second
  - `candles_1h_1m` — rolling 60-minute window written every minute
  - `candles_1d_1h` — rolling 24-hour window written every hour
- Computes multi-period RSI (`rsi_7`, `rsi_14`, `rsi_28`) per canonical
  timeframe and persists each series into a long-format `features_v1` table.
- Provides reader and writer helpers for `features_v1`, the `models` registry,
  the `backtests` log, and the `predictions` hypertable.

Coming next (Phase 3):

- Walk-forward backtest engine with realistic slippage and commission.
- One baseline rules-based strategy (RSI + CVD slope) backtested across the
  in-scope tickers.
- Persisted run metrics in `public.backtests`.

Coming later (Phase 4):

- Tabular ML baseline (LightGBM) over the full multi-timeframe feature
  vector with time-based train/val/test splits.
- Live inference loop that writes the latest `predictions` row per ticker.

## Quick start

```bash
cd apps/backtest-python

# Recommended: uv (https://docs.astral.sh/uv/)
uv venv
uv pip install -e ".[dev]"

# Or with pip
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Connect to the same TimescaleDB used by write-node.
export TIMESCALE_DB_URL="postgres://..."
```

Then:

```bash
# Read canonical candles
uv run python -m backtest.cli read-candles --ticker ES --timeframe 1m_1s --limit 50

# Build and persist multi-period RSI on 1h candles
uv run python -m backtest.cli build-features rsi \
  --ticker ES --timeframe 1h_1m \
  --period 7 --period 14 --period 28 \
  --start 2026-01-01 --end 2026-04-01

# Read features back
uv run python -m backtest.cli read-features \
  --ticker ES --timeframe 1h_1m --feature rsi_14 --limit 10
```

Run the test suite (no DB required):

```bash
uv run pytest -q
```

## Database

This app reads canonical tables owned by `@lib/db-timescale` and writes its
own derived tables (`features_v1`, `models`, `backtests`, `predictions`). All
schema changes go through that package's migrations. See
`docs/project/backtest-python.md` for the proposed schema.

## Project goals and architecture

- `docs/project/roadmap.md` — phased roadmap across all apps
- `docs/project/backtest-python.md` — architecture, schema, and step-by-step
  implementation plan for this app
- `AGENTS.md` — concise rules for engineers and AI agents working in this app

## Status

| Area                                                        | Status         |
| ----------------------------------------------------------- | -------------- |
| Project skeleton                                            | shipped        |
| DB connection + canonical candle reader                     | shipped        |
| `features_v1` / `models` / `backtests` / `predictions` migration | shipped   |
| Long-format `features_v1` writer + wide-format reader       | shipped        |
| Multi-timeframe RSI feature (`rsi_7`, `rsi_14`, `rsi_28`)   | shipped        |
| Walk-forward backtest engine                                | Phase 3 (next) |
| LightGBM baseline model                                     | Phase 4        |
| Live inference loop                                         | Phase 4        |
