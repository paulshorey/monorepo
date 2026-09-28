# Sliding-window background and sources

This page records where the [concept](README.md) came from, what the archived
implementation did, and outside research that supports or limits it. Everything
under `archive/` is reference only; the [design](design.md) is the current plan.

## Origin

The idea predates this repository's current layout. Its clearest statement is in
the retired Node writer's instructions, removed in commit `d9727fd`:

> Standard platforms calculate a 60-minute candle once per hour. This platform
> calculates it **every minute** using a sliding window over the previous 60
> minutes. … Indicators like RSI are calculated per minute_index independently (60
> separate RSI calculators for a 60m timeframe).

```sh
git show 'd9727fd^:apps/market-write-node/AGENTS.md'
```

That revision's `minute_index` and `second_index` are this design's `phase_index`.
It also contains `docs/data-indicators/example/calculate-indicator-values.md` and
its `.ts` example, which stream one phase at a time through a Wilder RSI, and
`docs/data-backtesting/optimization.md`, which proposes in-memory lookbacks. Their
performance figures were never measured on this platform.

## Archived implementation compared with the plan

| Topic             | Archived behavior                                                                                                       | Current plan                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Rolling candles   | The writer built `1m@1s` and `1h@1m` ([minute engine][rw], [hourly engine][rcw]).                                       | Keep the idea; reimplement in Python.                                                                          |
| Hourly inputs     | Selected non-overlapping minute-boundary rows ([hourly selector][sel]).                                                 | Build from 1-minute base bars.                                                                                 |
| Indicators        | [RSI][rsi] ran on each table's full series ([builder][bld]). For `1h@1m`, that is a 1-minute RSI.                       | Run each indicator per phase.                                                                                  |
| Closures          | Skipped scheduled closures, which [session tests][sess] verify.                                                         | [Keep skipping them](design.md#7-closures-and-data-gaps), using an exchange calendar; never skip missing data. |
| No-trade seconds  | Stored zero-volume synthetic seconds ([candle schema][schema]).                                                         | Empty slots with a status; no synthetic prices.                                                                |
| Futures contracts | Merged contracts under one ticker using a volume-based front-month pick ([reuse review][review]).                       | Keep actual contracts and explicit roll rules.                                                                 |
| Storage           | One table per timeframe with plain time indexes ([old schema][ts]). The `minute_index` index was proposed, never built. | One [proposed table](../../lib/db-research/README.md) with a generated `phase_index`.                          |

The old SQL sketches ([one-minute][sql1m], [one-hour][sql1h]) contain `DROP TABLE`
commands; do not apply them. The [reuse review][review] also notes that the archived
work never demonstrated predictive value.

Other archived notes add context but not design authority: the
[original plan](../../archive/project-docs/plan.md) (which also proposed `1d@1h`),
[CVD notes](../../archive/apps/write-node/docs/data-indicators/cvd-from-tbbo.md)
(CVD needs an explicit origin), the [chart loader](../../archive/apps/view-next/lib/market-data/candles.ts),
and the [writer instructions](../../archive/apps/write-node/AGENTS.md).

## Outside research

| Topic                   | Finding                                                                                                                          | Source                                                                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Timing luck             | Changing only a portfolio's rebalance schedule often moved factor index returns by over 100 basis points a year.                 | Hoffstein, Faber & Braun, [Rebalance Timing Luck](https://doi.org/10.2139/ssrn.3673910) (2020)                                                                                       |
| Offset sampling grids   | High-frequency volatility estimation combines many offset sampling grids instead of relying on one sparse grid.                  | Zhang, Mykland & Aït-Sahalia, [A Tale of Two Time Scales](https://www.nber.org/papers/w10111) (2005)                                                                                 |
| Overlapping windows     | Multi-period returns are autocorrelated by construction, and standard errors computed as if they were independent are too small. | Nelson & Kim, [NBER w3297](https://www.nber.org/papers/w3297); Richardson & Stock, [NBER w3335](https://www.nber.org/papers/w3335)                                                   |
| Overlapping ML labels   | Weight samples by uniqueness; purge and embargo overlapping labels in cross-validation.                                          | López de Prado, _Advances in Financial Machine Learning_ (2018), chapters 4 and 7                                                                                                    |
| Trailing-window lag     | A simple moving average lags the latest value by about half its window.                                                          | [Moving average](https://en.wikipedia.org/wiki/Moving_average)                                                                                                                       |
| Rolling maximum/minimum | A monotonic deque needs at most three comparisons per element.                                                                   | Lemire, [Streaming maximum-minimum filter](https://arxiv.org/abs/cs/0610046) (2006)                                                                                                  |
| Session calendars       | CME Globex calendars model the daily 16:00–17:00 CT break, holidays, and early closes such as 12:15 CT.                          | [pandas_market_calendars](https://github.com/rsheftel/pandas_market_calendars)                                                                                                       |
| Indicator warmup        | Recursive indicators such as RSI and EMA depend on their seed until enough bars pass.                                            | [TA-Lib unstable period](https://ta-lib.org/api/unstable-period)                                                                                                                     |
| Rolling candles         | Charting tools offer rolling indicators such as rolling VWAP; our search found none with per-phase trailing-window candles.      | [pandas rolling windows](https://pandas.pydata.org/docs/user_guide/window.html), [TradingView rolling VWAP](https://www.tradingview.com/support/solutions/43000598723-rolling-vwap/) |

The individual techniques are established. This project's contribution would be
combining them correctly and measuring the result.

[rw]: ../../archive/apps/write-node/src/lib/trade/rolling-window.ts
[rcw]: ../../archive/apps/write-node/src/lib/trade/rolling-candle-window.ts
[sel]: ../../archive/apps/write-node/src/stream/candles-1h-1m-aggregator.ts
[rsi]: ../../archive/apps/backtest-python/src/backtest/features/rsi.py
[bld]: ../../archive/apps/backtest-python/src/backtest/features/builder.py
[sess]: ../../archive/apps/write-node/src/lib/trade/rolling-session-continuity.test.ts
[schema]: ../../archive/apps/write-node/docs/data-storage/candles-schema.md
[review]: ../../archive/review-notes/reuse-review.md
[ts]: ../../archive/lib/db-timescale/schema/current.sql
[sql1m]: ../../archive/apps/write-node/docs/data-storage/1s-base-1m-aggregate.sql
[sql1h]: ../../archive/apps/write-node/docs/data-storage/1m-base-1h-aggregate.sql
