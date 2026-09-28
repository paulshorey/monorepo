# @lib/db-trading

Database-first package for the `TRADING_DB_URL` database.

This package owns:

- migration history
- current schema snapshot
- generated TypeScript/JSON schema artifacts
- shared SQL query contracts

If application code and database structure disagree, this package should be the
place where the contract is fixed.

## Environment

Set:

```bash
export TRADING_DB_URL="postgres://..."
```

`db:schema:snapshot` and `db:verify` require local PostgreSQL client tools.
Use the same PostgreSQL major version as the target DB server and CI
(`pg_dump`/`psql` 17 for the current GitHub Actions workflow). The snapshot
script fails fast if the local client major version does not match the server.

## Fresh empty database

Use this flow for a brand-new empty Postgres database:

```bash
pnpm --filter @lib/db-trading db:migrate
pnpm --filter @lib/db-trading db:verify
```

What this does:

- creates the baseline tables
- applies all forward migrations
- regenerates schema/type artifacts during verification
- fails if the generated artifacts do not match the migrated DB

## Existing database that already has the baseline schema

Use this only if the database already contains the baseline tables from an
older/manual setup and has not yet been put under migration tracking:

```bash
pnpm --filter @lib/db-trading db:migrate:baseline
pnpm --filter @lib/db-trading db:migrate
pnpm --filter @lib/db-trading db:verify
```

`db:migrate:baseline` records only baseline migrations. It does **not** mark
later migrations as applied.

## Existing populated tables with schema changes

The migration runner supports in-place upgrades. The migration file must define
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

If the conversion is unsafe, add a new column, backfill it, update app code,
then drop the old column in a later migration.

## Commands

### Apply migrations

```bash
pnpm --filter @lib/db-trading db:migrate
```

### Verify DB contract

```bash
pnpm --filter @lib/db-trading db:verify
```

`db:verify` is not read-only. It runs `db:migrate` first, then regenerates
local contract artifacts and checks them with `git diff --exit-code`.

### Create a new migration

```bash
pnpm --filter @lib/db-trading db:migration:new -- add_order_status
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
pnpm --filter @lib/db-trading db:schema:snapshot
pnpm --filter @lib/db-trading db:types:generate
```

Or:

```bash
pnpm --filter @lib/db-trading db:sync
```

For most engineering work, `db:verify` is the safer command because it checks
reproducibility too.

## CI

This package is verified in GitHub Actions against a fresh Postgres container:

- migrations must run on an empty DB
- expected tables/constraints must exist
- generated files must remain reproducible

## Files to update when the schema changes

- `migrations/*.sql`
- `schema/current.sql`
- `generated/typescript/db-types.ts`
- `generated/contracts/db-schema.json`
- `queries/**/*.sql` when shared SQL contracts change
- `sql/*` adapters when application read/write code changes

## Related docs

- `AGENTS.md` - concise rules for engineers and AI agents
- `migrations/README.md` - migration authoring details
- `docs/db/management-playbook.md` - repo-wide DB workflow
