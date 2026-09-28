# Migration

> For the current database-first workflow (migration scripts, baselining, schema/type regeneration), see `docs/db/management-playbook.md`.

## Quick guide (primary): migrate `order_v1` from old DB to new DB

Run these in this exact order:

```bash
# 1) Set connection strings as env vars (quote to preserve ? and &)
export OLD_DATABASE_URL='postgresql://neondb_owner:npg_yKfHca6urAh1@ep-fancy-resonance-ad6zxgez-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
export NEW_DATABASE_URL='postgresql://postgres:SGalwZYCPBxcvvbdXwiURFNFpXcbTaHv@tramway.proxy.rlwy.net:58028/railway'
# 2) (Optional but recommended) Check source row count before migration
psql "$OLD_DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT COUNT(*) AS old_count FROM public.order_v1;"
# 3) Dump schema+data for only order_v1 into a retryable file
pg_dump "$OLD_DATABASE_URL" -Fc -t public.order_v1 -f order_v1.dump
# 4) Restore into new DB
# --clean/--if-exists makes it safe if order_v1 already exists in target
pg_restore -d "$NEW_DATABASE_URL" -Fc -v --clean --if-exists order_v1.dump
# 5) Verify row count in target
psql "$NEW_DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT COUNT(*) AS new_count FROM public.order_v1;"
# 6) Check whether id uses a sequence (serial/identity)
psql "$NEW_DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT pg_get_serial_sequence('public.order_v1', 'id') AS seq_name;"
# 7) If seq_name is NOT NULL, reset sequence to MAX(id)+1
psql "$NEW_DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT setval(pg_get_serial_sequence('public.order_v1', 'id'), COALESCE((SELECT MAX(id) FROM public.order_v1), 0) + 1);"
```

## Supplementary notes

### Generic table migration patterns

Use connection URLs directly; host/port/user/password/SSL options are parsed from the URL.

#### Schema only

```bash
pg_dump "$OLD_DATABASE_URL" --schema-only -t public.TABLE_NAME \
  | psql "$NEW_DATABASE_URL" -v ON_ERROR_STOP=1
```

#### Schema and data (file-based, recommended default)

```bash
pg_dump "$OLD_DATABASE_URL" -Fc -t public.TABLE_NAME -f migration.dump
pg_restore -d "$NEW_DATABASE_URL" -Fc -v migration.dump
```

#### Data only (when schema already exists in target)

```bash
pg_dump "$OLD_DATABASE_URL" -a -t public.TABLE_NAME -f migration.dump
pg_restore -d "$NEW_DATABASE_URL" -a -v migration.dump
```

#### Schema and data (quick pipe)

```bash
pg_dump "$OLD_DATABASE_URL" -t public.TABLE_NAME \
  | psql "$NEW_DATABASE_URL" -v ON_ERROR_STOP=1
```

### Additional operational tips

- Use schema-qualified table names (for example: `public.log_v1`).
- Keep `-v ON_ERROR_STOP=1` on `psql` so the process fails fast.
- Dry run schema dump to inspect SQL first:

```bash
pg_dump "$OLD_DATABASE_URL" --schema-only -t public.TABLE_NAME > schema.sql
psql "$NEW_DATABASE_URL" -v ON_ERROR_STOP=1 -f schema.sql
```

- Multiple tables can be included with repeated `-t`, for example:

```bash
pg_dump "$OLD_DATABASE_URL" -Fc -t public.table1 -t public.table2 -f migration.dump
```

- For extra large tables, see [backups.md](./backups.md) and use directory format (`-Fd -j`) with a direct (non-pooled) connection when available.

### Sequence/identity checks and reset

After migrating data into tables with serial/identity columns, reset sequences:

```sql
SELECT setval(
  pg_get_serial_sequence('public.TABLE_NAME', 'id'),
  COALESCE((SELECT MAX(id) FROM public.TABLE_NAME), 0) + 1
);
```

### Quick checks:

```sql
-- Returns sequence name or NULL
SELECT pg_get_serial_sequence('public.log_v1', 'id');

-- Serial/identity often shows nextval(...) default
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'log_v1';
```

```sql
-- Identity-only check ('a' or 'd' in attidentity)
SELECT a.attname, a.attidentity
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'log_v1' AND n.nspname = 'public'
  AND a.attnum > 0 AND NOT a.attisdropped;
```

### Prior `strength_v1` one-off fix notes (reference)

These were table-specific cleanup steps after a migration and may not be needed for other tables:

```sql
-- Add unique constraint required by ON CONFLICT logic
ALTER TABLE strength_v1
ADD CONSTRAINT strength_v1_ticker_timenow_unique UNIQUE (ticker, timenow);

-- Ensure id has an owned sequence and correct next value
CREATE SEQUENCE strength_v1_id_seq;
SELECT setval('strength_v1_id_seq', COALESCE((SELECT MAX(id) FROM strength_v1), 0) + 1);
ALTER TABLE strength_v1 ALTER COLUMN id SET DEFAULT nextval('strength_v1_id_seq');
ALTER SEQUENCE strength_v1_id_seq OWNED BY strength_v1.id;

-- Manual column rename used in this specific migration
ALTER TABLE strength_v1 RENAME COLUMN created_at TO updated_at;
```
