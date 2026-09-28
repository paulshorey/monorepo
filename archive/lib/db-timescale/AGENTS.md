# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# @lib/db-timescale

Database-first package for the `TIMESCALE_DB_URL` database.

## Source of truth

- `migrations/`: canonical schema history for Timescale/Postgres
- `schema/current.sql`: generated schema snapshot
- `queries/`: SQL contracts shared across language clients

## Runtime adapter

- `lib/db/timescale.ts`: pooled DB connection accessor used by TypeScript apps.

## Polyglot support

Contract artifacts under this package should support future generated bindings
for TypeScript, Python, C#, and R.

## Notes

- Fresh empty DB: run `pnpm --filter @lib/db-timescale db:migrate`, then `db:verify`.
- Existing pre-migration DB with baseline schema already present: run `db:migrate:baseline` once, then `db:migrate`, then `db:verify`.
- The migration runner creates `timescaledb` if needed; the DB role must have permission to create extensions.
- `db:verify` is not read-only; it runs `db:migrate` first.
- Only run `db:migrate` / `db:verify` against a deployed remote DB when the user explicitly requests it. Check connectivity and pending migrations first.
- Never manually create or alter tables outside migrations.
- Migration files are forward-only SQL; do not add `BEGIN` / `COMMIT`.
- For populated tables, migrations must explicitly backfill data and explicitly convert types with `USING` where needed.
- Write Timescale operations idempotently when possible (`IF NOT EXISTS`, `if_not_exists => TRUE`).
- After schema changes, keep `migrations/`, `schema/current.sql`, generated artifacts, queries, and app consumers in sync.
