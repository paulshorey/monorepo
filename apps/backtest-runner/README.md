# Backtest runner

Python CLI/API for loading historical data, analyzing its quality, running strategy
experiments, and saving reproducible results. Future work adds custom feature/model
pipelines and more detailed execution models.

Run `python3 scripts/research.py` from the repository root. Commands:
`catalog`, `analyze --dataset ID`,
`run --dataset ID --config PATH`, and `serve --port 8000`.
See [example configurations](examples/) and the [data workflow](../../docs/project/data.md).

The local API exposes GET `/api/health`, `/api/datasets`, `/api/quality/:dataset`,
`/api/runs`, and `/api/runs/:id`; POST `/api/runs` accepts a dataset id and config.
Runs execute synchronously and save data provenance, parameters, decisions, fills,
costs, and equity as JSON.

The importer derives observed minute bars from local Databento TBBO CSV trades.
The current simulator uses completed minute bars, next observed bar fills, fixed
position sizes, full collateral, fees/slippage, and a drawdown halt. Final positions
are marked to market. Margin, funding, session close-out, contract rolls, ML training,
and broker execution are not implemented. The API is for local development.
