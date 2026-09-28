# Backfill runbook

How to backfill canonical candle tables for one or more tickers across a date
range. The process is the same whether you're seeding a fresh database or
filling a historical gap, only the start/end dates change.

## Prerequisites

- `TIMESCALE_DB_URL` exported and reachable from the machine running the script.
- A Databento account with TBBO access for the in-scope dataset (e.g.
  `GLBX.MDP3` for CME).
- Local disk with enough room for raw TBBO JSONL files. Compressed TBBO is
  ~tens of MB per ticker per day, expanded JSONL is much larger.
- Migrations applied:

  ```bash
  pnpm --filter @lib/db-timescale db:migrate
  pnpm --filter @lib/db-timescale db:verify
  ```

## Step 1 — Download Databento TBBO

Use the `databento` CLI or Python client to pull TBBO for the parent symbols
you need across the date range. Example with the CLI:

```bash
databento batch download \
  --dataset GLBX.MDP3 \
  --schema tbbo \
  --stype-in parent \
  --symbols ES.FUT,NQ.FUT,GC.FUT,SI.FUT,HG.FUT,CL.FUT \
  --start 2026-01-01 \
  --end 2026-02-01 \
  --output ./data/tbbo/2026-01
```

Notes:

- Use `parent` symbology to get all front-month rolls in one job. The writer's
  `FrontMonthTracker` selects the active contract and ignores the rest.
- Spread contracts (e.g. `ESZ5-ESH6`) are skipped automatically by the writer.
- Files arrive as JSONL (one trade per line). Verify with `head -1 file.json`.

## Step 2 — Backfill `candles_1m_1s`

```bash
export TIMESCALE_DB_URL="postgres://..."
pnpm --filter write-node historical:tbbo \
  ./data/tbbo/2026-01/*.json
```

The script:

- reads each file line by line
- groups trades into per-ticker rolling 60-second windows written every second
- forward-fills short no-trade gaps as zero-volume seconds
- resets the window after extended open-market gaps
- seeds CVD from the latest `cvd_close` already in `candles_1m_1s` so multi-pass
  backfills stay continuous
- upserts into `candles_1m_1s` so re-running the same files is safe

Expected output per file is a summary block that should match these
quality gates:

- `Skipped (spreads)` > 0 for CME futures
- `Active contract per ticker` matches the front month for the date range
- `Out-of-order ignored` should be zero or near-zero
- `Gap resets` should be small unless the date range crosses extended outages

## Step 3 — Rebuild `candles_1h_1m`

```bash
pnpm --filter write-node historical:1h1m --truncate
```

The script:

- reads minute-boundary rows from `candles_1m_1s`
- reduces them through the same rolling-candle engine used by the live
  aggregator
- writes one row per minute to `candles_1h_1m` with the trailing 60 minutes

Use `--truncate` for full deterministic rebuilds. Without it, the script
upserts in place. For an incremental fill, omit `--truncate`.

## Step 4 — Rebuild `candles_1d_1h`

```bash
pnpm --filter write-node historical:1d1h --truncate
```

The script:

- reads hour-boundary rows from `candles_1h_1m`
- reduces them through the rolling-candle engine with `windowSize=24, expectedIntervalMs=1h`
- writes one row per hour to `candles_1d_1h` with the trailing 24 hours

`--truncate` is recommended for the first build. For incremental fills, omit it.

## Step 5 — Verify continuity

After backfill, run the following sanity checks against the DB. Examples in
psql; substitute your client of choice.

### Row count per day per ticker (no surprise gaps)

```sql
SELECT ticker, date_trunc('day', "time") AS d, count(*) AS n
FROM candles_1m_1s
WHERE "time" >= '2026-01-01' AND "time" < '2026-02-01'
GROUP BY ticker, d
ORDER BY ticker, d;
```

For a 23-hour Globex day you should see ~82,800 rows per ticker per day in
`candles_1m_1s` (60 _ 60 _ 23). Holiday / half-trading days will be lower.

### CVD continuity (no jumps mid-row)

```sql
SELECT ticker, "time", cvd_close,
       cvd_close - LAG(cvd_close) OVER (PARTITION BY ticker ORDER BY "time") AS d_cvd
FROM candles_1m_1s
WHERE ticker = 'ES'
ORDER BY "time" DESC
LIMIT 50;
```

`d_cvd` should equal the row's `vd` value (or zero on synthetic / no-trade
seconds). Big unexplained jumps point to ingest gaps.

### Hourly and daily layer alignment

```sql
SELECT ticker,
       max("time") FILTER (WHERE "time" = date_trunc('minute', "time")) AS last_min_boundary,
       (SELECT max("time") FROM candles_1h_1m WHERE ticker = c1.ticker) AS last_1h,
       (SELECT max("time") FROM candles_1d_1h WHERE ticker = c1.ticker) AS last_1d
FROM candles_1m_1s c1
GROUP BY ticker
ORDER BY ticker;
```

The hourly layer should be at most 1 minute behind the latest minute-boundary
row. The daily layer should be at most 1 hour behind the latest hour-boundary
row in `candles_1h_1m`.

## Step 6 — Optional: monitor the live writer

After backfill, start `write-node` against the same DB. The live aggregators
auto-hydrate from the most recent canonical rows, so live and historical paths
will line up without a separate cutover.

```bash
pnpm --filter write-node start
```

Sanity-check the running process:

```bash
curl -s http://localhost:8080/api/v1/health
curl -s http://localhost:8080/api/v1/stats | jq
```

`/api/v1/stats` exposes the stream status, counters, and per-ticker rolling
window state (warmup progress, ring size, current CVD). Use it for liveness,
warmup completion, and to confirm all configured tickers are producing data.

## Common backfill pitfalls

- **Mixed datasets.** Don't combine TBBO files from different datasets in one
  run. The writer assumes one canonical session/threshold profile per ticker.
- **Mismatched stype.** Files downloaded with `stype=parent` and `stype=raw_symbol`
  produce identical canonical output, but stay consistent within a backfill.
- **Reusing the same files mid-stream.** If the live writer is running against
  the target DB, prefer running the backfill into the same DB. Both paths
  upsert into `candles_1m_1s` by `(ticker, time)` so they cooperate
  deterministically; just expect duplicate work, not duplicate rows.
- **CVD drift.** If you truncate `candles_1m_1s` mid-backfill, also truncate
  `candles_1h_1m` and `candles_1d_1h` and rebuild them, otherwise downstream
  tables will hold stale CVD anchors.
