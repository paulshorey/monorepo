# Backup & Restore

## Quick summary

Backup old table (only data)

```
pg_dump "postgresql://neondb_owner:npg_yKfHca6urAh1@ep-fancy-resonance-ad6zxgez-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" --no-owner -a -t public.strength_v1 -f ./pg_strength_v1_data.sql
```

Clear new table (keep schema)

```
psql "postgresql://postgres:SGalwZYCPBxcvvbdXwiURFNFpXcbTaHv@tramway.proxy.rlwy.net:58028/railway" -c "TRUNCATE public.strength_v1"
```

Restore new table (only data)

```
psql "postgresql://postgres:SGalwZYCPBxcvvbdXwiURFNFpXcbTaHv@tramway.proxy.rlwy.net:58028/railway" -v ON_ERROR_STOP=1 -f ./pg_strength_v1_data.sql
```

Then add indexes

```
SELECT setval(pg_get_serial_sequence('public.strength_v1', 'id'), COALESCE((SELECT MAX(id) FROM public.strength_v1), 0) + 1);
```

## Backing up and restoring large tables

Use connection URLs (host, port, user, password, and SSL options are parsed from the URL). Replace `DATABASE_URL` and `TABLE_NAME` with real values.

### Recommended: Single-file (custom format)

Produces one compressed `.dump` file. Works with pooled connections (Postgres, Railway). Restore supports parallel workers.

**Backup:**

```bash
pg_dump "$DATABASE_URL" -Fc -t public.TABLE_NAME -f backup.dump
```

**Restore:**

```bash
pg_restore -d "$DATABASE_URL" -Fc -j 4 -v backup.dump
```

### Plain SQL (single file)

Simple text SQL. Good for small tables or when you want to inspect/edit the dump.

**Backup:**

```bash
pg_dump "$DATABASE_URL" -t public.TABLE_NAME -f backup.sql
```

**Restore:**

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backup.sql
```

**With gzip:**

```bash
pg_dump "$DATABASE_URL" -t public.TABLE_NAME | gzip > backup.sql.gz
gunzip -c backup.sql.gz | psql "$DATABASE_URL" -v ON_ERROR_STOP=1
```

---

### Parallel multi-file (extra large tables)

For very large databases with many tables, directory format (`-Fd`) with parallel jobs (`-j`) can be faster. Produces a **directory** of files, not a single file.

**Backup:**

```bash
rm -rf backup_dir  # pg_dump refuses to write to an existing non-empty directory
pg_dump "$DATABASE_URL" -Fd -j 4 -t public.TABLE_NAME -f backup_dir
```

**Restore:**

```bash
pg_restore -d "$DATABASE_URL" -Fd -j 4 -v backup_dir
```

**Caveats:**

- `pg_dump -j 4` opens 5 connections. Pooled connections (Postgres `-pooler`, PgBouncer) often fail with "Broken pipe"—use single-file mode instead.
- Use a **direct** (non-pooled) connection URL when available.
- `-j 4` is a starting point; increase based on CPU cores. Ensure `max_connections` allows it.

---

### Tips

#### Schema vs data

- **Schema only:** Add `--schema-only` to `pg_dump` (no data).
- **Data only:** Add `-a` / `--data-only` to `pg_dump` (schema must already exist in target).

#### Compression for tables with already-compressed data

If the table has columns like `bytea` or stored blobs, built-in compression can slow things down. Disable it and compress externally:

```bash
# Dump with no compression (directory format)
rm -rf backup_dir
pg_dump "$DATABASE_URL" -Fd -Z 0 -t public.TABLE_NAME -f backup_dir
tar -cf - backup_dir | pigz -p 4 > backup_dir.tar.gz

# Restore
pigz -dc backup_dir.tar.gz | tar -xf -
pg_restore -d "$DATABASE_URL" -Fd -v backup_dir
```

#### Restore into a clean table

Use `--clean` with `pg_restore` to drop the table first:

```bash
pg_restore -d "$DATABASE_URL" --clean --if-exists -Fc backup.dump
```

#### Sequence reset after data restore

If the table has serial/identity columns:

```sql
SELECT setval(pg_get_serial_sequence('public.TABLE_NAME', 'id'), COALESCE((SELECT MAX(id) FROM public.TABLE_NAME), 0) + 1);
```

Check: `SELECT pg_get_serial_sequence('public.TABLE_NAME', 'id');` — non‑null means a sequence exists.

#### Verify after restore

```sql
SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE relname = 'TABLE_NAME';
```

#### Verbose output

Add `-v` to `pg_dump` and `pg_restore` to see progress.

#### Connection URL format

Use full URLs like `postgresql://user:pass@host:port/dbname?sslmode=require`. See [connect.md](./connect.md).
