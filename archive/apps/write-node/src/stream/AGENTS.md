# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Live Streaming Data Processing

Real-time TBBO trade data from Databento is aggregated into rolling
1-minute candles at 1-second resolution and written to `candles_1m_1s`.
Those canonical minute rows are then reduced to rolling 1-hour candles at
1-minute resolution and written to `candles_1h_1m`.

This live path is part of the canonical source-of-truth writer pipeline.
It should remain aligned with historical ingest and should not absorb
downstream feature-engineering or ML-specific logic.

## How It Works

- **`tbbo-stream.ts`** connects to Databento's Raw TCP API, authenticates, and subscribes to TBBO (Top of Book on Trade) data for configured symbols
  - Parses newline-delimited JSON messages from the socket
  - Builds an instrument_id-to-symbol lookup from symbol mapping messages (rtype=22)
  - Converts trade messages (action="T") into `TbboRecord` objects
  - Skips spread contracts (symbols containing "-") and gates trades by the configured session calendar using the trade event timestamp
  - Passes each valid trade to the aggregator

- **`tbbo-1m-aggregator.ts`** is the live wrapper around the shared rolling-window engine
  - rejects late trades
  - classifies trade side
  - converts records into normalized trade input
  - finalizes stale seconds on a timer
  - writes pending rows to `candles_1m_1s`
  - forwards minute-boundary `candles_1m_1s` rows to the 1h writer
  - loads latest `cvd_close` values on startup for continuity

- **`src/lib/trade/rolling-window.ts`** owns the shared rolling-window logic used by both live and historical ingest
  - front-month selection
  - per-second aggregation
  - short-gap forward fill for zero-volume seconds
  - long-gap reset handling
  - 60-second warmup handling
  - trailing-window candle creation
  - pending candle queue management

- **`candles-1h-1m-aggregator.ts`** derives rolling hourly rows from canonical
  minute-boundary rows
  - hydrates from recent `candles_1m_1s` minute-boundary rows on startup
  - accepts only canonical lower-timeframe rows, never raw trades
  - writes `candles_1h_1m`

- **`src/lib/trade/rolling-candle-window.ts`** owns the shared higher-timeframe
  rolling aggregation used by live and historical `1h@1m`

## Configuration

Environment variables (all required):

| Variable                      | Example                    | Description                                        |
| ----------------------------- | -------------------------- | -------------------------------------------------- |
| `DATABENTO_API_KEY`           | `db-abc...xyz`             | Databento API key                                  |
| `DATABENTO_DATASET`           | `GLBX.MDP3`                | Exchange dataset (CME Globex)                      |
| `DATABENTO_SYMBOLS`           | `ES.FUT,NQ.FUT`            | Comma-separated symbols                            |
| `DATABENTO_STYPE`             | `parent`                   | Symbol type: `parent` or `raw_symbol`              |
| `TIMESCALE_DB_URL`            | `postgres://...`           | TimescaleDB connection                             |
| `MARKET_SESSION_TIME_ZONE`    | `America/Chicago`          | Optional IANA time zone for the trading session    |
| `MARKET_SESSION_OPEN_WINDOWS` | `Sun 17:00-Mon 16:00, ...` | Optional weekly open windows in local session time |

## Shared Libraries

The live path should stay intentionally thin. Shared libraries must carry the
behavior that batch and live ingest have in common:

- **`src/lib/trade/`** -- rolling window engine, candle aggregation, CVD tracking, front-month selection, trade side detection, DB writing, timestamp bucketing
- **`src/lib/metrics/`** -- metric helpers used during aggregation / persistence

Stream-specific code should only handle:

- TCP connection lifecycle
- Databento protocol details
- JSON parsing and symbol mapping
- session-calendar gating
- retry / timer orchestration

## Roadmap

The current live writer supports `1m` candles at `1s` resolution.

The live writer now also maintains `1h` candles at `1m` resolution by deriving
them from the minute-boundary subset of `candles_1m_1s`.

## CVD Continuity

On startup, the aggregator queries `candles_1m_1s` for the latest `cvd_close` per ticker. This ensures CVD is continuous across server restarts. If the table is empty or unreachable, CVD starts from 0.
