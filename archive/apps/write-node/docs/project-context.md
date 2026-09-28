# Project context

## Purpose of `write-node`

`write-node` is the canonical write pipeline for detailed market
timeseries data.

Its job is to ingest historical and live market data, aggregate it, calculate
the core per-row values needed for storage, and persist a stable source of
truth for downstream systems.

## What this app should produce

Current:

- `1m` candles written at `1s` resolution

Current next layer:

- `1h` candles written at `1m` resolution

Implementation rule:

- `1h@1m` is derived from the minute-boundary subset of canonical `1m@1s` rows

Not planned here:

- model training
- model inference
- broad indicator research notebooks or experimental backtesting logic

## Core design idea

The saved cadence is finer than the candle timeframe.

Examples:

- a 1-minute candle can be recalculated and saved every second
- a 1-hour candle can be recalculated and saved every minute

So each stored row represents a **rolling window**, not just a traditional bar
that appears once after the timeframe closes.

## Why this data matters

The timeseries written here is intended to be durable source-of-truth data.

Downstream apps should rely on these tables rather than re-implementing the raw
trade aggregation rules independently.

That means changes in this app should prioritize:

- determinism
- consistency between historical and live ingest
- clear schema semantics
- minimal duplicated logic

## Downstream boundary

`apps/backtest-python` sits downstream from this writer.

That app consumes the canonical historical and live timeseries to:

- align across canonical timeframes (1m@1s, 1h@1m, planned 1d@1h)
- apply multiple lookback periods
- calculate indicators and features such as RSI, multi-period CVD slope, and volatility
- store model-ready parameters in `features_v1` and run training/backtests
  recorded to `models`, `backtests`, and `predictions`

`write-node` remains focused on canonical timeseries writing, not full feature
engineering or ML workflows. See `docs/project/backtest-python.md` at the repo
root for that app's plan.
