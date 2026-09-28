# Databento historical ingest

Historical backfills are handled by `scripts/tbbo-1m-1s.ts`.

They must produce the same canonical source-of-truth rows as live ingest.

## Input format

The script expects JSONL trade files:

- one JSON object per line
- not a JSON array
- typically downloaded or exported from Databento historical data tooling

Example:

```json
{
  "ts_recv": "2025-11-30T23:00:00.039353882Z",
  "hd": { "ts_event": "2025-11-30T23:00:00.000000000Z", "rtype": 1, "publisher_id": 1, "instrument_id": 42140878 },
  "action": "T",
  "side": "N",
  "depth": 0,
  "price": "6913.500000000",
  "size": 1,
  "flags": 0,
  "ts_in_delta": 13803,
  "sequence": 3353,
  "levels": [{ "bid_px": "6915.750000000", "ask_px": "6913.000000000", "bid_sz": 1, "ask_sz": 1 }],
  "symbol": "ESH6"
}
```

## What the script does

1. read files line-by-line
2. skip non-trade records and spread contracts
3. classify trade side
4. feed the same shared rolling-window engine used by live ingest
5. upsert rows into `candles_1m_1s`
6. resume CVD from the latest stored rows before processing starts

The follow-up canonical rebuild step is:

7. read minute-boundary `candles_1m_1s` rows
8. build rolling `candles_1h_1m` rows

## Usage

```bash
pnpm --filter write-node historical:tbbo "/path/to/file1.json" "/path/to/file2.json"
```

or directly:

```bash
pnpm --filter write-node exec tsx scripts/tbbo-1m-1s.ts "/path/to/file1.json"
```

## Why the historical path matters

Backfills must match live behavior closely. Any change to:

- front-month stitching
- trade-side classification
- rolling-window warmup
- CVD handling

should be shared between live and historical ingest rather than implemented
twice.

This script is part of the source-of-truth writer pipeline, not a downstream
feature-generation pipeline.
