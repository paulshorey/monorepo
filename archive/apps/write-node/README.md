# ARCHIVED — write-node

Retired experiment. Do not deploy or use as an active dependency. See the root README and docs/project/reuse-review.md.

# write-node

Canonical futures timeseries writer.

This app maintains:

- `candles_1m_1s`: rolling 1-minute candles written every second from TBBO trades
- `candles_1h_1m`: rolling 1-hour candles written every minute from the
  minute-boundary subset of `candles_1m_1s`
- `candles_1d_1h`: rolling 1-day candles written every hour from the
  hour-boundary subset of `candles_1h_1m`

The shared rolling engine forward-fills short no-trade gaps as zero-volume
seconds so minute-boundary rows stay available for the hourly layer. Extended
open-market gaps reset warmup instead of combining distant activity into one
"continuous" window. Scheduled closures from the configured session calendar are
treated as paused time, so rolling VWAP/CVD continuity carries across closes
and reopens without hardcoding UTC hours.

## What this app does

`write-node` is the source-of-truth write pipeline for canonical market
timeseries data.

It should:

- ingest historical and live TBBO data
- stitch front-month contracts
- classify aggressive trade side
- compute canonical 1-minute rolling rows
- derive canonical 1-hour rolling rows from canonical 1-minute rows

It should not own downstream feature engineering or ML workflows.

## Database ownership and setup

This app does not own database migrations directly.

- `@lib/db-timescale` owns the `TIMESCALE_DB_URL` schema contract
- `write-node` depends on that package for canonical candle tables

### Fresh empty Timescale database

Use this path for a new environment with no existing tables:

```bash
export TIMESCALE_DB_URL="postgres://..."
pnpm --filter @lib/db-timescale db:migrate
pnpm --filter @lib/db-timescale db:verify
```

What this does:

- creates the baseline candle tables
- applies forward migrations such as:
  - `candles_1h_1m`
  - `candles_1m_1s` contract cleanup
  - Timescale hypertable/compression setup
- verifies that `schema/current.sql` and generated DB artifacts still match the
  migrated database

### Existing database that already has the baseline schema

Use this path only if the database already contains the baseline tables from a
manual or legacy setup:

```bash
export TIMESCALE_DB_URL="postgres://..."
pnpm --filter @lib/db-timescale db:migrate:baseline
pnpm --filter @lib/db-timescale db:migrate
pnpm --filter @lib/db-timescale db:verify
```

Do **not** use `db:migrate:baseline` for a fresh empty database.

### Existing populated tables with schema changes

The migration runner supports in-place upgrades, but the migration SQL must
define how existing data is handled.

Examples:

- new column on populated table:
  1. add nullable column or safe default
  2. backfill with `UPDATE`
  3. add `NOT NULL` or other strict constraint
- type change:
  - use `ALTER COLUMN ... TYPE ... USING ...` so existing rows are converted

If a future migration cannot safely transform existing data by SQL alone, the
migration file must document the extra manual or application-side step. That is
the exception, not the default.

## Database setup

This app uses the `TIMESCALE_DB_URL` database owned by `@lib/db-timescale`.

### 1. Ensure Timescale/Postgres is available

Set:

```bash
export TIMESCALE_DB_URL="postgres://..."
```

The target database must support the TimescaleDB APIs used by the migrations,
including hypertables and compression policies. The DB role must be allowed to
create the `timescaledb` extension.

### 2. Apply the DB migration

From the repo root:

```bash
pnpm --filter @lib/db-timescale db:migrate
pnpm --filter @lib/db-timescale db:verify
```

This must create/update:

- `candles_1m_1s`
- `candles_1h_1m`

### 3. Refresh schema snapshot and generated DB artifacts

Only do this when you are maintaining the DB package itself and intend to commit
updated DB artifacts.

After the migration has been applied to the target database, refresh the DB
contract artifacts:

```bash
pnpm --filter @lib/db-timescale db:schema:snapshot
pnpm --filter @lib/db-timescale db:types:generate
```

Or run both after migration:

```bash
pnpm --filter @lib/db-timescale db:sync
```

For normal deploy/bootstrap work, prefer:

```bash
pnpm --filter @lib/db-timescale db:migrate
pnpm --filter @lib/db-timescale db:verify
```

## Historical rebuild flow

### TBBO -> canonical 1m@1s

```bash
pnpm --filter write-node historical:tbbo "/path/to/file1.json" "/path/to/file2.json"
```

### Canonical 1m@1s -> canonical 1h@1m

```bash
pnpm --filter write-node historical:1h1m --truncate
```

### Canonical 1h@1m -> canonical 1d@1h

```bash
pnpm --filter write-node historical:1d1h --truncate
```

Notes:

- `historical:1h1m` reads only minute-boundary rows from `candles_1m_1s`
- `historical:1d1h` reads only hour-boundary rows from `candles_1h_1m`
- `--truncate` is recommended for a full deterministic rebuild
- without `--truncate`, the script upserts into the target table
- for an empty DB, run the DB migrations first, then rebuild in order:
  `candles_1m_1s` → `candles_1h_1m` → `candles_1d_1h`

See [`docs/backfill.md`](./docs/backfill.md) for the full end-to-end runbook
including downloading TBBO, continuity checks, and live-writer verification.

## Live flow

Start the live writer:

```bash
pnpm --filter write-node start
```

Required env vars:

- `TIMESCALE_DB_URL`
- `DATABENTO_API_KEY`
- `DATABENTO_DATASET`
- `DATABENTO_SYMBOLS`
- `DATABENTO_STYPE`

Optional session-calendar env vars:

- `MARKET_SESSION_PROFILE` - named session profile from
  `src/lib/trade/market-session-config.ts`; when set, it overrides per-ticker
  profile selection for the whole process
- `MARKET_SESSION_TIME_ZONE` - IANA time zone for the trading session
  (overrides the selected profile's time zone)
- `MARKET_SESSION_OPEN_WINDOWS` - comma-separated weekly open windows in local
  session time (overrides the selected profile's windows), for example:
  `Sun 17:00-Mon 16:00, Mon 17:00-Tue 16:00, Tue 17:00-Wed 16:00, Wed 17:00-Thu 16:00, Thu 17:00-Fri 16:00`

Session profiles live in `src/lib/trade/market-session-config.ts`. Start by
adding/adjusting entries in `SESSION_PROFILE_BY_TICKER`, then use
`MARKET_SESSION_PROFILE` only when you intentionally want one process-wide
override. Use the time zone / open-windows env vars only when you need local
profile overrides.

Live behavior:

1. raw TBBO trades -> `candles_1m_1s`
2. successful 1m writes at minute boundaries feed the hourly aggregator
3. minute-boundary rows -> `candles_1h_1m`

The live stream gates trades by the trade event timestamp in the configured
session calendar, not by fixed UTC close/reopen assumptions.

On startup, the hourly writer hydrates itself from the most recent
minute-boundary `candles_1m_1s` rows so it does not need a fresh 60-minute
warmup.

## Developer rules

- `1h@1m` must be derived from canonical `1m@1s` rows, not raw trades
- use only minute-boundary rows from `candles_1m_1s` as 1-hour source inputs
- do not average lower-timeframe ratios when building higher-timeframe rows
- recompute derived metrics from aggregated raw fields
- keep historical and live behavior aligned through shared library code
- `price_pct` is stored in basis points
- `sum_price_volume / volume` is the query-time VWAP formula
- do not manually create or alter Timescale tables; make schema changes in
  `@lib/db-timescale/migrations`
- after schema changes, run `pnpm --filter @lib/db-timescale db:verify`

## Related docs

- `lib/db-timescale/README.md` - DB package setup and migration workflow
- `docs/db/management-playbook.md` - repo-wide migration patterns

## Validation

```bash
pnpm --filter write-node build
pnpm build
```
