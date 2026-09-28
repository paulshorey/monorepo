# Databento live ingest

This app connects directly to Databento's Raw TCP API and requests **JSON**
encoding for the TBBO schema.

Relevant implementation: `src/stream/tbbo-stream.ts`

The rows written from this live path are canonical source-of-truth timeseries
rows for downstream consumers.

## What the live path does

1. connect to `{dataset}.lsg.databento.com:13000`
2. complete CRAM authentication
3. subscribe to TBBO for the configured symbols
4. resolve `instrument_id -> symbol` from mapping messages
5. convert trade records into normalized trade input
6. feed the shared rolling-window engine
7. flush completed rows to `candles_1m_1s`
8. derive minute-boundary hourly rows into `candles_1h_1m`

## Environment

Required environment variables:

- `DATABENTO_API_KEY`
- `DATABENTO_DATASET`
- `DATABENTO_SYMBOLS`
- `DATABENTO_STYPE`
- `TIMESCALE_DB_URL`

## Important behavior

- market-hours gating happens in the stream layer
- spread contracts are skipped
- late-trade rejection happens before aggregation
- CVD continuity is restored from the latest DB rows on startup
- shutdown waits for a final flush

## Why JSON encoding is used

JSON is slower than binary DBN, but it keeps the current writer pipeline simple
and inspectable while the aggregation model is still evolving.

That trade-off is acceptable for the current scope because correctness and
maintainability are more important than squeezing every last percent out of the
ingest path right now.

## Boundary

This live writer should stop at canonical timeseries persistence.

Downstream feature engineering, multi-lookback indicator generation, and ML
training/inference belong in the future `market-analyze-python` app.
