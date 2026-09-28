# TBBO-derived row metrics

`candles_1m_1s` stores a rolling 60-second candle plus a small set of order-flow
metrics derived directly from TBBO trades and top-of-book snapshots.

These are canonical stored row values for the writer pipeline itself, not the
full downstream feature set that future analysis apps may derive from them.

## Metrics stored today

| Metric                    | Meaning                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `vd`                      | volume delta: `ask_volume - bid_volume`                       |
| `cvd_open/high/low/close` | cumulative volume delta OHLC across the rolling window        |
| `vd_ratio`                | normalized aggressor imbalance                                |
| `book_imbalance`          | normalized passive depth imbalance                            |
| `price_pct`               | rolling price change in basis points                          |
| `divergence`              | disagreement flag between price direction and delta direction |
| `trades`                  | trade count                                                   |
| `max_trade_size`          | largest trade in the window                                   |
| `big_trades`              | count of trades above the configured large-trade threshold    |
| `big_volume`              | volume from those large trades                                |

Richer multi-timeframe or multi-lookback feature sets belong downstream in
`market-analyze-python`, not in this app's source-of-truth table design.

`sum_price_volume` is stored as the additive accumulator needed for query-time
VWAP calculation: `sum_price_volume / volume`. There is no stored `vwap`
column in the canonical candle tables.

## Trade-side classification

TBBO records may already include aggressor side information. When they do not,
the pipeline falls back to a midpoint comparison using the best bid and ask
from the trade snapshot.

That classification drives:

- `ask_volume`
- `bid_volume`
- `vd`
- `cvd_*`

Volume that still cannot be classified is accumulated in `unknown_volume`.

## Large-trade detection

Large-trade thresholds are configured per ticker in `src/lib/trade/thresholds.ts`.
They currently feed:

- `max_trade_size`
- `big_trades`
- `big_volume`

## Query example

```sql
SELECT
  time,
  ticker,
  open,
  high,
  low,
  close,
  volume,
  ask_volume,
  bid_volume,
  vd,
  vd_ratio,
  cvd_open,
  cvd_high,
  cvd_low,
  cvd_close,
  divergence,
  trades,
  max_trade_size,
  big_trades,
  big_volume
FROM candles_1m_1s
WHERE ticker = 'ES'
ORDER BY time DESC
LIMIT 20;
```
