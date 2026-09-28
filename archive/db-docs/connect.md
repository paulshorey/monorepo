## Connecting to remote databases from a local machine

`psql`, `pg_dump`, and `pg_restore` connect over the network. You run them locally and they talk to remote hosts.

### Connection URL (recommended)

Pass the full connection URL. Host, port, user, password, and SSL options are all parsed from it:

```bash
psql "postgresql://user:pass@host:port/db?sslmode=require"
pg_dump "postgresql://user:pass@host:port/db?sslmode=require" -t public.log_v1 -f backup.dump
pg_restore -d "postgresql://user:pass@host:port/db?sslmode=require" backup.dump
```

Note: `pg_restore` requires `-d` for the connection URL; the last argument is the archive file.

**Using an environment variable:**

```bash
psql "$DATABASE_URL"
pg_dump "$DATABASE_URL" -t public.log_v1 -f backup.dump
pg_restore -d "$DATABASE_URL" backup.dump
```

---

### Installing PostgreSQL client tools

If `psql` or `pg_dump` are not installed:

**macOS (Homebrew):**

```bash
brew install libpq
brew link --force libpq
```

**Docker (no local install):**

```bash
docker run -it --rm postgres:16 psql "postgresql://user:pass@host:port/db?sslmode=require"
```

---

### SSL mode (required for most cloud providers)

Neon, Railway, and most hosted Postgres require SSL. Add `?sslmode=require` to the URL (or use the URL your provider gives you—it usually includes this).

```bash
psql "postgresql://user:pass@host:port/db?sslmode=require"
```

**SSL modes:**

| Mode          | Behavior                                  |
| ------------- | ----------------------------------------- |
| `disable`     | No SSL                                    |
| `prefer`      | Try SSL, fall back if unavailable         |
| `require`     | SSL required, no certificate verification |
| `verify-ca`   | SSL and verify server CA                  |
| `verify-full` | SSL, verify CA and hostname               |

Use `require` for Neon, Railway, and similar cloud databases.

**Neon URLs** often include `sslmode=require` and `channel_binding=require`—use the URL as-is:

```
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

### Password in the URL

The password goes between `:` and `@` in the URL:

```
postgresql://user:PASSWORD@host:port/db?sslmode=require
```

**Special characters in passwords:** URL-encode them, or use `PGPASSWORD` if the URL parsing fails:

```bash
PGPASSWORD='p@ss:word' psql "postgresql://user@host:port/db?sslmode=require"
```

**`.pgpass` file** (no password in URL or env, more secure):

```
# ~/.pgpass format: hostname:port:database:username:password
db.example.com:5432:railway:postgres:mysecret
```

Set permissions: `chmod 600 ~/.pgpass`. Tools read it automatically when no password is in the URL.

---

### Connection URL format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

| Part | Example |
|------|---------|
| User | Before first `:` |
| Password | Between `:` and `@` |
| Host | Between `@` and `:` |
| Port | After host `:` |
| Database | After last `/`, before `?` |
| Options | After `?` (e.g. `sslmode=require`) |

Cloud providers give you the full URL—use it as-is. See [migrations.md](./migrations.md) and [backups.md](./backups.md) for examples.

---

### Tips

#### Connection timeout

If the host is slow to respond:

```bash
PGCONNECT_TIMEOUT=30 psql "$DATABASE_URL"
```

#### Firewall and allowlists

Cloud databases often restrict access by IP. Add your IP in the provider’s dashboard (Neon, Railway, etc.) or use a VPN/bastion if required.

#### Connection limits

`pg_dump -j 4` uses 5 connections (1 + 4 workers). Ensure the database `max_connections` is high enough and you’re not sharing a limited pool with many services.
