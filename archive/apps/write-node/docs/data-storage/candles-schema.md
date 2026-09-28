# canonical candles schema

## Contract source of truth

The canonical DB contract lives in `@lib/db-timescale`:

- `lib/db-timescale/migrations/`
- `lib/db-timescale/schema/current.sql`
- `lib/db-timescale/generated/typescript/db-types.ts`

This app owns the writer logic, but the DB package owns the schema contract.

## Current tables

This app writes two rolling canonical tables:

- `candles_1m_1s`
- `candles_1h_1m`

`candles_1m_1s` is the canonical trade-derived layer.

`candles_1h_1m` is the canonical higher-timeframe layer derived from the
minute-boundary subset of `candles_1m_1s`.

## Sampling model

### `candles_1m_1s`

Each row is:

- one ticker
- one second timestamp
- the trailing 60-second rolling window ending at that second

The shared 1m engine forward-fills short no-trade gaps as zero-volume seconds so
minute-boundary rows remain available for the hourly layer. Extended
open-market inactivity resets warmup instead of stitching distant seconds into
one continuous window, but scheduled closures from the configured session
calendar are skipped so rolling windows remain continuous across closes and
reopens.

### `candles_1h_1m`

Each row is:

- one ticker
- one minute timestamp
- the trailing 60-minute rolling window ending at that minute

This table is built only from the minute-boundary subset of canonical
`candles_1m_1s` rows. It is never derived directly from raw trades.

## Write paths

Both ingest modes build `candles_1m_1s`:

- `src/stream/tbbo-stream.ts` -> live ingest
- `scripts/tbbo-1m-1s.ts` -> historical backfill

Both use the shared rolling 1m engine in `src/lib/trade/rolling-window.ts`.

`candles_1h_1m` is then derived from minute-boundary `candles_1m_1s` rows:

- `src/stream/candles-1h-1m-aggregator.ts` -> live derivation
- `scripts/candles-1h-1m.ts` -> historical rebuild

Both use `src/lib/trade/rolling-candle-window.ts`.

## Shared columns

These columns exist on both canonical tables:

| Column | Meaning |
| --- | --- |
| `ticker` | stitched front-month ticker such as `ES` |
| `symbol` | latest contributing raw contract symbol |
| `open/high/low/close` | rolling price OHLC for that table's window |
| `volume` | total rolling traded volume |
| `ask_volume` | rolling aggressive buy volume |
| `bid_volume` | rolling aggressive sell volume |
| `unknown_volume` | volume whose side could not be classified |
| `cvd_open/high/low/close` | CVD OHLC across the same rolling window |
| `vd` | `ask_volume - bid_volume` |
| `vd_ratio` | normalized aggressor imbalance computed from `ask_volume` and `bid_volume` |
| `book_imbalance` | normalized passive depth imbalance computed from `sum_bid_depth` and `sum_ask_depth` |
| `price_pct` | price change in basis points across the rolling window |
| `divergence` | price-vs-delta disagreement signal |
| `trades` | trade count in the rolling window |
| `max_trade_size` | largest trade in the rolling window |
| `big_trades` | count of trades above the configured threshold |
| `big_volume` | volume from those large trades |
| `sum_bid_depth` | additive top-of-book bid-size accumulator |
| `sum_ask_depth` | additive top-of-book ask-size accumulator |
| `sum_price_volume` | additive accumulator used for query-time VWAP: `sum_price_volume / volume` |

There is no canonical per-row `vwap` column. The writer stores the additive
inputs needed to derive VWAP when reading.

## Table-specific time semantics

| Table | `time` meaning | Window meaning |
| --- | --- | --- |
| `candles_1m_1s` | second timestamp | trailing 60 seconds |
| `candles_1h_1m` | minute timestamp | trailing 60 minutes |

## Why additive accumulators are stored

The writer stores both derived metrics and additive raw inputs so the higher
timeframe layer can be recomputed correctly from lower canonical rows.

That is why the hourly layer recomputes fields like `vd_ratio`,
`book_imbalance`, `price_pct`, and `divergence` from aggregated raw values
instead of averaging lower-timeframe ratios.

## Downstream usage

These tables are the canonical source-of-truth timeseries for downstream
consumers.

Future analysis/ML apps should read from these tables and write their own
derived feature tables instead of expanding the writer schema for every new
feature.

## SQL examples

See:

- `1s-base-1m-aggregate.sql` for `candles_1m_1s`
- `1m-base-1h-aggregate.sql` for `candles_1h_1m`
