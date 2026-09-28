# Timescale Migrations

This directory is the canonical schema history for `TIMESCALE_DB_URL`.

## Baseline

- `202602180131__baseline.sql` is the canonical bootstrap baseline for the
  current writer scope.
- For existing databases that already contain this schema, mark it applied with:
  - `pnpm --filter @lib/db-timescale db:migrate:baseline`
- The baseline marker only records `__baseline` files, so later forward migrations
  will still apply normally.
- Current canonical runtime tables are `candles_1m_1s` and `candles_1h_1m`.

## Naming

- `YYYYMMDDHHMM__description.sql`

## Rules

- Do not edit applied migrations in active shared environments.
- Add forward-only migrations.
- Keep schema ownership here even if apps use raw SQL.
- Do not add `BEGIN` / `COMMIT` inside migration files; the runner wraps each file
  in a transaction.
- For populated tables, prefer additive/backfill migrations:
  1. add nullable column or safe default
  2. backfill existing rows with `UPDATE`
  3. add `NOT NULL` / constraints after data is clean
- For type changes, use explicit `USING` expressions so existing rows are
  converted automatically.
- Write Timescale operations idempotently (`IF NOT EXISTS`, `if_not_exists => TRUE`)
  so repeatable provisioning stays safe.
- For operations that cannot run inside a transaction (for example
  `CREATE INDEX CONCURRENTLY`), add `-- cursor:no-transaction` at the top of
  the migration file.

## Typical flow

1. Create migration:
   - `pnpm --filter @lib/db-timescale db:migration:new -- add_candles_15m_table`
2. Edit the new SQL file in this folder.
3. Apply to target DB:
   - `pnpm --filter @lib/db-timescale db:migrate`
4. Verify migrated DB contract:
   - `pnpm --filter @lib/db-timescale db:verify`
5. Refresh schema snapshot + generated types:
   - `pnpm --filter @lib/db-timescale db:schema:snapshot`
   - `pnpm --filter @lib/db-timescale db:types:generate`
