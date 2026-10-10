# Backtesting and trading bot development platform

A developer platform for configuring, troubleshooting, and testing trading metrics,
strategies, and machine-learning models for futures and crypto markets.

The workflow starts with historical Databento TBBO trades and trade-time top-of-book
quotes. Developers will build custom metrics, train models on those
metrics, compare strategies through reproducible backtests, and inspect results in
a charting UI. The same strategy logic will later support continuous paper and live
trading, with controls to monitor, pause, and override bot decisions.

## Workspace

| Path                   | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `apps/backtest-runner` | Python CLI/API for historical data analysis and backtest experiments      |
| `apps/research-web`    | UI for strategy configuration, charts, execution details, and run history |
| `lib/strategy-core`    | Shared Python metrics, strategy logic, and replay calculations            |
| `lib/research-charts`  | Reusable charting components                                              |
| `lib/db-research`      | Proposed PostgreSQL schema and storage contract; not connected or applied |
| `data/manifests`       | Dataset sources, checksums, and instrument metadata                       |

Python owns research and trading calculations. The planned metric explorer uses
code-defined metrics and settings; its frontend visualizes and inspects results.
`archive/` is reference-only, excluded from active builds and deployments.

## Run locally

Requirements: Node 20+, pnpm 10.28.1, and Python 3.11+.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [the local UI](http://127.0.0.1:4400/). Its `/api` requests are proxied to the
Python API on port 8001. The current Python baseline uses the standard library.

```sh
python3 scripts/research.py catalog
python3 scripts/research.py analyze --dataset YOUR_DATASET
pnpm backtest --dataset YOUR_DATASET --config apps/backtest-runner/examples/es.json
pnpm test
pnpm build
```

## Development focus

The current foundation provides a local Databento TBBO CSV importer, trade-derived
minute bars, SMA/RSI baseline strategies, a replay simulator, and a results UI.
No historical files are bundled. ML training and live execution are planned.

Next, obtain TBBO history, validate its coverage, and use it to develop custom
metrics, models, algorithms, apps, and services. See the [data workflow](docs/project/data.md) and
[roadmap](docs/project/roadmap.md). The [metric explorer architecture](docs/project/metric-explorer.md)
defines the next app, including [sliding-window candles](docs/sliding-windows/README.md)
and a [proposed storage design](lib/db-research/README.md).

## Private phone access through Tailscale

Run `pnpm dev:tailscale --background` from the repository root.
Use `pnpm dev:tailscale:status` and `pnpm dev:tailscale:stop` to manage it.
The shared tool lives in `~/git/tailscale-dev`; this project's setup and address
are in [the local Tailscale guide](docs/local-development-tailscale.md).
