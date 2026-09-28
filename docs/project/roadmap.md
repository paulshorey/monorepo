# Platform roadmap

## 1. Historical data

Obtain Databento TBBO trade and trade-time top-of-book data for supported futures
and crypto markets. Choose instruments and date ranges; record dataset, raw symbols,
source files, and instrument metadata. Validate ordering, duplicates, gaps, and
coverage before deriving candles or metrics. Keep futures contracts and roll rules
explicit.

## 2. Metrics, strategies, and ML

Build reusable Python metrics and feature pipelines. Develop configurable rule-based
strategies and ML models trained on custom metrics. Use chronological training,
validation, and holdout periods, and version inputs, parameters, and model artifacts.

## 3. Backtesting and developer tools

The [historical metric explorer plan](metric-explorer.md) proposes modernizing
`view-next` for code-defined metrics/settings and read-only inspection of model inputs.
The separate [sliding-window concept](../sliding-windows/README.md) and
[engineering design](../sliding-windows/design.md) define phase-correct indicators
and backtesting. A [PostgreSQL schema](../../lib/db-research/README.md) is proposed
for later database setup; the initial workflow can use files.

Expand the runner to run and compare experiments defined in code, and the UI to
troubleshoot features, signals, orders, costs, and equity. Improve execution
assumptions for each market and add apps or services as the research workflow
requires.

## 4. Continuous trading and control

Apply the same strategy logic to historical warmup plus incoming live data. Develop
paper trading first, then broker execution, recovery, and position reconciliation.
Provide configuration, monitoring, pause/resume, risk limits, and manual overrides
with a record of automated and human decisions.

The current local foundation includes TBBO CSV ingestion to minute trade bars,
baseline strategies, replay accounting, and a charting UI. Sliding-window candles,
broader tick metrics, ML training, and bot execution are the next development stages.
