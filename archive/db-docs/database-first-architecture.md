# Database-First Monorepo Architecture

This monorepo uses database-first contracts so apps in any language can share the
same schema truth.

## Packages

- `@lib/db-trading` for `TRADING_DB_URL`
- `@lib/db-timescale` for `TIMESCALE_DB_URL`

Each package contains:

- `migrations/` - canonical schema history
- `schema/current.sql` - generated snapshot
- `queries/` - language-agnostic SQL contracts
- `generated/` - derived language outputs (TypeScript, Python, C#, R)

## Current app usage

- `apps/log-next`, `apps/view-next`, `apps/tradingview-node` import SQL helpers
  from `@lib/db-trading/sql/*`.
- `apps/write-node` uses pooled Timescale access from
  `@lib/db-timescale/lib/db/timescale`.

## Migration policy

- Use forward-only migrations with immutable timestamped filenames.
- Never edit an applied migration.
- Regenerate schema snapshots and generated language artifacts in CI.

## Workflow guide

Use `docs/db/management-playbook.md` for migration operations:

- first-time baseline on existing DBs
- adding/editing columns
- adding tables
- regenerating TypeScript schema types
