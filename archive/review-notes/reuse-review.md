# Review of the retired monorepo

The reusable value is mainly market-data semantics and visualization, not a trading
strategy with demonstrated predictive value. All originals remain under
`archive/`; paths in the first column below are relative to that directory.

| Original                                                                      | Decision                         | New home / reason                                                                                                                                                                                        |
| ----------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/view-next/features/tradingview/lib/primitives/VerticalLinePrimitive.ts` | Extracted                        | `lib/research-charts/src/VerticalLinePrimitive.ts`; removed unused series reference, request redraw on updates; used for risk-halt events                                                                |
| `apps/view-next/features/tradingview/lib/chartConfig.ts`                      | Adapted                          | `lib/research-charts/src/chartConfig.ts`; dark canvas, crosshair, grid/time scales retained; explicit UTC, normal scaling and TradingView attribution                                                    |
| `apps/view-next/features/tradingview/SyncedCharts.tsx`                        | Reused design, rewrote component | Price and equity panes share time/crosshair in `ResearchChart`; no old Zustand/DB/polling dependencies                                                                                                   |
| `apps/write-node/src/lib/trade/side-detection.ts`                             | Ported pure quote test           | Python `strategy_core/order_flow.py`; call it a midpoint quote test, not complete Lee–Ready; preserve unknowns and reject crossed quotes                                                                 |
| `apps/write-node/src/lib/metrics/book-imbalance.ts`                           | Ported with correction           | Same imbalance formula; no depth returns `None`, not a falsely neutral zero                                                                                                                              |
| `apps/write-node/src/lib/metrics/absorption.ts`                               | Ported as experimental feature   | Thresholded price/volume disagreement; no inference that this proves accumulation or profitability                                                                                                       |
| `apps/write-node/src/lib/trade/rolling-window.ts`                             | Reused architectural idea        | Event-time incremental state, bounded indicator windows and warmup; `Replay.on_bar` is shared by batch and sequential feeds                                                                              |
| `apps/write-node/src/lib/trade/canonical-candle.ts`, `candle-aggregation.ts`  | Keep as reference                | Structural separation between source data and derived features is valuable; TBBO-specific aggregation and DB payloads belong in their own adapters.                                              |
| `apps/write-node/src/lib/trade/market-session*.ts`                            | Reference only                   | Explicit timezones/session boundaries are valuable. Recurring weekly windows lack holiday overrides; not a complete futures calendar                                                                     |
| `apps/write-node/src/lib/trade/front-month.ts`                                | Reference only                   | Rolling volume is a candidate roll policy, not an execution model. It selects one contract, discards others, and reacts to arrival order/current-minute volume. New ingestion selects explicit contracts |
| `lib/db-trading`, `lib/db-timescale`                                          | Archive                          | Migration/query/generated-contract separation is worth retaining later; old schemas couple research to ingestors and rolling windows                                                                     |
| `apps/tradingview-node/src/lib/strength.ts`                                   | Do not port                      | Receipt-time timestamps, forward-filled multi-period values, future placeholder rows; no reproducible indicator implementation or reliable historical event clock                                        |
| `apps/log-next`, `lib/common`                                                 | Archive                          | UI logging/error boundary ideas are ordinary; pulling the shared package would reintroduce old Next/Mantine/DB coupling                                                                                  |
| `apps/backtest-python`                                                        | Restarted as requested           | Old feature/table scaffolding is not a backtesting engine. New Python code was written independently                                                                                                     |

## Behaviors intentionally excluded

- `aggregatePriceData.ts` anchors normalization to the **last** available price. Fine
  as a descriptive chart transformation, but leaks future information as a feature.
- `aggregateDataUtils.ts` forward-fills and adds 12 hours of projected flat data.
  These are presentation conventions, not observed history or future targets.
- `rolling-window.ts` fills synthetic seconds and aggregates overlapping trailing
  windows. Naively resampling those as ordinary disjoint candles double-counts data.
- Old trade-side inference uses the midpoint only, without the full tick-test/time
  alignment methodology implied by its Lee–Ready name.
- OHLCV TradeBars do not contain aggressor side or book depth. CVD, imbalance and
  absorption must stay unavailable until genuine trade/quote inputs are added.
- Automated contract selection is not enough: positions, price adjustments, expiry,
  spread costs, multipliers and roll transactions must remain explicit.

## New research contract

`Bar` is a UTC minute interval with an opening timestamp and a known-at-close time.
`Strategy.on_bar` returns a desired position direction after observing a completed
bar. `Replay` separately applies the prior decision at the next observed bar open,
charges costs, marks equity and applies the drawdown rule. Its single-step and batch
paths are tested for equality; prefix tests ensure later data cannot change prior
results. This is shared decision logic, not proof of broker/live fill parity.

Start with transparent SMA and Wilder RSI baselines to validate infrastructure.
Advanced features and ML should earn their place through out-of-sample evaluation;
none of the old heuristic comments establish an edge.
