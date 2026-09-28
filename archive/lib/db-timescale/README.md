# @lib/db-timescale

Database-first package for the `TIMESCALE_DB_URL` database.

This package owns:

- Timescale/Postgres migration history
- current schema snapshot
- generated TypeScript/JSON schema artifacts
- shared SQL query contracts for canonical candle tables

If application code and the Timescale schema disagree, fix the contract here.

## Current scope

Canonical timeseries tables (writer: `apps/write-node`):

- `public.candles_1m_1s`
- `public.candles_1h_1m`
- `public.candles_1d_1h`

Downstream research tables (writer: `apps/backtest-python`):

- `public.features_v1` — long-format derived feature timeseries (hypertable)
- `public.models` — model registry
- `public.backtests` — backtest run summaries
- `public.predictions` — model predictions per `(model_id, ticker, time)`
  (hypertable)

`db:migrate` converges the schema to exactly the tables listed above (plus
the migration bookkeeping table `schema_migrations_cursor`). `db:verify`
enforces the same allowlist along with each table's index and hypertable
configuration.

## Environment

Set:

```bash
export TIMESCALE_DB_URL="postgres://..."
```

`db:schema:snapshot` and `db:verify` require local PostgreSQL client tools.
Use the same PostgreSQL major version as the target DB server and CI
(`pg_dump`/`psql` 17 for the current GitHub Actions workflow). The snapshot
script fails fast if the local client major version does not match the server.

The target DB must support TimescaleDB. The migration runner executes:

```sql
CREATE EXTENSION IF NOT EXISTS timescaledb
```

so the DB role must be allowed to create that extension.

## Fresh empty database

Use this flow for a brand-new empty Timescale/Postgres database:

```bash
pnpm --filter @lib/db-timescale db:migrate
pnpm --filter @lib/db-timescale db:verify
```

What this does:

- applies baseline schema history for canonical candle writes
- applies forward migrations such as:
  - `candles_1h_1m`
  - `candles_1m_1s` contract cleanup
  - Timescale hypertable/compression setup
  - `candles_1d_1h` (24h rolling window over hour-boundary rows)
  - `features_v1`, `models`, `backtests`, `predictions` (downstream
    `apps/backtest-python` tables)
- verifies expected tables, indexes, hypertables, and generated artifacts

## Existing database that already has the baseline schema

Use this only if the database already contains the baseline Timescale schema
from an older/manual setup and has not yet been put under migration tracking:

```bash
pnpm --filter @lib/db-timescale db:migrate:baseline
pnpm --filter @lib/db-timescale db:migrate
pnpm --filter @lib/db-timescale db:verify
```

`db:migrate:baseline` records only baseline migrations. It does **not** skip
later forward migrations.

## Existing populated tables with schema changes

The migration runner supports in-place upgrades, but the migration SQL must say
how existing data is handled.

### Add a new column/index

Recommended pattern:

```sql
ALTER TABLE public.example ADD COLUMN status text;

UPDATE public.example
SET status = 'ready'
WHERE status IS NULL;

ALTER TABLE public.example
  ALTER COLUMN status SET NOT NULL;

CREATE INDEX IF NOT EXISTS example_status_idx
  ON public.example (status);
```

### Change a column type

Write the conversion explicitly:

```sql
ALTER TABLE public.example
  ALTER COLUMN amount TYPE numeric(18,4)
  USING amount::numeric(18,4);
```

### Timescale-specific changes

Write Timescale operations idempotently when possible:

- `CREATE INDEX IF NOT EXISTS ...`
- `create_hypertable(..., if_not_exists => TRUE, ...)`
- `add_compression_policy(..., if_not_exists => TRUE)`

If a future migration cannot safely transform existing data by SQL alone, the
migration file must document the extra manual/application-side step.

## Commands

### Apply migrations

```bash
pnpm --filter @lib/db-timescale db:migrate
```

### Verify DB contract

```bash
pnpm --filter @lib/db-timescale db:verify
```

`db:verify` is not read-only. It runs `db:migrate` first, then regenerates
local contract artifacts and checks them with `git diff --exit-code`.

### Create a new migration

```bash
pnpm --filter @lib/db-timescale db:migration:new -- add_candles_4h_1m
```

Migration files are forward-only SQL. Do not add `BEGIN` / `COMMIT`; the runner
wraps each file in a transaction.

For operations that cannot run inside a transaction, add this marker at the top
of the file:

```sql
-- cursor:no-transaction
```

Example use case: `CREATE INDEX CONCURRENTLY`.

### Regenerate snapshot and types

Use these when maintaining the package itself:

```bash
pnpm --filter @lib/db-timescale db:schema:snapshot
pnpm --filter @lib/db-timescale db:types:generate
```

Or:

```bash
pnpm --filter @lib/db-timescale db:sync
```

For most engineering work, `db:verify` is the safer command because it checks
reproducibility too.

## CI

This package is verified in GitHub Actions against a fresh Timescale container:

- migrations must run on an empty DB
- expected tables, indexes, and hypertables must exist
- generated files must remain reproducible

## Files to update when the schema changes

- `migrations/*.sql`
- `schema/current.sql`
- `generated/typescript/db-types.ts`
- `generated/contracts/db-schema.json`
- `queries/**/*.sql` when shared SQL contracts change
- app consumers when canonical candle contracts change

## Related docs

- `AGENTS.md` - concise rules for engineers and AI agents
- `migrations/README.md` - migration authoring details
- `docs/db/management-playbook.md` - repo-wide DB workflow
- `apps/write-node/README.md` - writer app workflow using this package
