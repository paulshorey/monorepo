# Project goals

Build a backtesting and trading bot development platform for futures and crypto.
Developers configure, troubleshoot, and test custom metrics, strategies, and ML
models trained on those metrics. Historical research comes first; paper and live
trading will reuse strategy logic with a UI for monitoring and human overrides.

The next priority is obtaining and validating Databento TBBO trade and trade-time
top-of-book data, deriving candles from observed trades, then developing metrics,
models, apps, algorithms, and services around those inputs.

## Code boundaries

- `apps/backtest-runner`: Python data workflow, experiment runner, API, and saved results.
- `apps/research-web`: current UI for baseline backtests: settings, charts, fills, and run history.
- `lib/strategy-core`: shared Python metrics, strategies, and replay calculations.
- `lib/research-charts`: reusable frontend charts.
- `lib/db-research`: proposed PostgreSQL schema and storage contract; not applied or connected.
- `archive/`: reference-only snapshot of past decisions; do not deploy it or import it into active code.

Keep calculations in Python and separate strategy decisions from data access,
execution adapters, and UI code. Use `@/` for same-app frontend imports and relative
imports inside libraries. Add apps and libraries when a concrete need arises.

## Metric explorer and candles

The next app is the historical metric explorer described in
`docs/project/metric-explorer.md`. Define metrics, parameters, and feature sets in
Python code; the UI only visualizes and inspects results.

Candles follow the design in `docs/sliding-windows/`. It is not implemented yet; the
current runner uses ordinary clock-aligned minute bars. When implementing it:

- Build `1h@1m` and `1m@1s` rolling candles at every step from the last 60 disjoint
  base bars (1-minute or 1-second) aggregated from trades.
- Count windows in trading time: scheduled closures from the instrument's exchange
  calendar add no slot. Never infer a closure from missing data; mark it as a gap.
- Run each indicator per phase, on candles one full period apart (13:07, 12:07,
  11:07, …). Never feed consecutive rolling candles into an indicator or add up
  their overlapping volumes.
- Treat adjacent candles as strongly correlated: one portfolio in backtests, and
  chronological, purged splits for ML.

Database setup and population are deferred; do not connect or apply the proposed
schema as part of planning work.

## Research principles

- Preserve dataset provenance, timestamps, instrument/contract metadata, and execution assumptions.
- Report data gaps and unavailable inputs; do not invent observations or order flow.
- Compute features and decisions using only information available at that time.
- Train and evaluate ML chronologically, with preprocessing fitted on training data only.
- Save enough configuration, data/model versions, costs, and outputs to reproduce and debug experiments.
- Keep credentials, downloaded market data, generated runs, and model artifacts out of git.

## Working conventions

Use pnpm for JavaScript tooling and install dependencies at the workspace root.
Python requires 3.11+. Use `python3 scripts/research.py` for the current runner.
Do not install dependencies inside build, test, dev, or start scripts.

For code changes, run relevant tests and `pnpm build`. For documentation changes,
check accuracy and links. Keep documentation short, avoid duplicated instructions,
and distinguish implemented behavior from planned capabilities.
