# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# @lib/db-trading

Database-first package for the `TRADING_DB_URL` database.

## Source of truth

- `migrations/`: canonical schema change history
- `schema/current.sql`: generated snapshot of expected schema
- `queries/`: language-agnostic SQL query contracts

## TypeScript adapter

- `lib/db/postgres.ts`: connection accessor for app/runtime code
- `sql/*`: table-specific query helpers and types used by current TypeScript apps.

## Notes

- Keep SQL and migration contracts database-first; generated language bindings are derived artifacts.
- Keep `sql/*` helpers focused on database access only (query shape, serialization, SQL defaults).
- Do not import `@lib/common` from this package. Runtime concerns like request IP lookup, response formatting, and SMS alerts belong in apps or `@lib/common`.
- Fresh empty DB: run `pnpm --filter @lib/db-trading db:migrate`, then `db:verify`.
- Existing pre-migration DB with baseline schema already present: run `db:migrate:baseline` once, then `db:migrate`, then `db:verify`.
- `db:verify` is not read-only; it runs `db:migrate` first.
- Only run `db:migrate` / `db:verify` against a deployed remote DB when the user explicitly requests it. Check connectivity and pending migrations first.
- Never manually create or alter tables outside migrations.
- Migration files are forward-only SQL; do not add `BEGIN` / `COMMIT`.
- For populated tables, migrations must explicitly backfill data and explicitly convert types with `USING` where needed.
- After schema changes, keep `migrations/`, `schema/current.sql`, generated artifacts, queries, and `sql/*` adapters in sync.
