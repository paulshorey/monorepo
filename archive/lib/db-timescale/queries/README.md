# Query Contracts

Store reusable SQL contracts here for candle/trade workloads.

Keep contract SQL language-agnostic so TypeScript, Python, C#, and R clients
can generate or implement bindings from the same definitions.

## Current contracts

- `candles/upsert_candles.sql`
- `candles/select_recent_candles.sql`
