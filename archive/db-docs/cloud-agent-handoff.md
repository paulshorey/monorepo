# Cloud Agent DB Handoff

## Branch

- `cursor/db-contract-checks-2d68`

## What was completed

### DB contract workflow and tooling

- Renamed the GitHub Actions check from `Verify Postgres contract` to
  `Verify Trading contract`.
- Fixed stale workflow path filters to use `apps/...`.
- Pinned CI database service versions and installed PostgreSQL 17 client tools
  in CI.
- Added a shared PostgreSQL client/server major-version preflight script:
  `scripts/check-postgres-client-version.sh`.
- Hardened schema snapshot scripts for:
  - `@lib/db-trading`
  - `@lib/db-timescale`
- Removed `pg_dump` version-banner noise from committed schema snapshots so
  contract files are deterministic across matching PostgreSQL 17 clients.

### Verify-script correctness

- Fixed all DB package `db:verify` scripts so `git diff --exit-code` checks the
  correct package-local artifact paths:
  - `lib/db-trading/scripts/verify-contract.mjs`
  - `lib/db-timescale/scripts/verify-contract.mjs`

### Contract artifacts committed

- Committed regenerated DB contract artifacts for trading and timescale.

### Documentation / agent instructions

- Updated:
  - `AGENTS.md`
  - `docs/db/management-playbook.md`
  - `lib/db-trading/AGENTS.md`
  - `lib/db-timescale/AGENTS.md`
  - `lib/db-trading/README.md`
  - `lib/db-timescale/README.md`
- Remote `db:migrate` / `db:verify` is now explicitly documented as allowed
  only when the user asks for it.
- Docs now explicitly state that `db:verify` is not read-only because it runs
  `db:migrate` first.

## Remote DB results from this agent

### Succeeded against real deployed databases

- `@lib/db-timescale`
  - `pnpm --filter @lib/db-timescale db:migrate`
  - `pnpm --filter @lib/db-timescale db:verify`
Both remote databases were reachable from this cloud environment and both
already had all known migrations applied before the commands were run.

### Trading DB status in this specific agent session

- `TRADING_DB_URL` was still injected into this running agent as:
  - host `postgres.railway.internal`
- That host is a Railway private-network hostname and was not resolvable from
  this cloud machine.
- The user later corrected the Trading DB secret, but this running agent did
  not receive the updated secret value.

## Why a fresh cloud agent session is needed

This agent session still sees the old injected `TRADING_DB_URL`. A fresh cloud
agent session should pick up the corrected secret value if the environment has
been updated successfully.

## What the next engineer should do first

In a fresh cloud agent session:

1. Confirm the injected Trading DB URL now points to a public host:

   ```bash
   node - <<'JS'
   const url = new URL(process.env.TRADING_DB_URL);
   console.log(url.hostname, url.port || '(default)', url.pathname.slice(1));
   JS
   ```

2. Confirm connectivity:

   ```bash
   psql "$TRADING_DB_URL" -Atqc "SELECT current_database(), current_user, inet_server_addr()::text, inet_server_port(), current_setting('server_version_num')"
   ```

3. Confirm there are no unexpected pending migrations:

   ```bash
   comm -23 <(ls lib/db-trading/migrations/*.sql | xargs -n1 basename | sort) <(psql "$TRADING_DB_URL" -Atqc "SELECT filename FROM public.schema_migrations_cursor ORDER BY filename" | sort) || true
   ```

4. Run the real remote Trading commands:

   ```bash
   pnpm --filter @lib/db-trading db:migrate
   pnpm --filter @lib/db-trading db:verify
   ```

5. If `db:verify` produces tracked-file diffs, review them, run:

   ```bash
   pnpm build
   ```

   then commit and push the resulting artifacts on this branch.

## Expected outcome in the fresh agent

If the corrected `TRADING_DB_URL` is now public and reachable, both
packages should be able to run against their real remote databases:

- `@lib/db-trading`
- `@lib/db-timescale`

## Relevant commits already on this branch

- `a71e2bf` - `fix: stabilize db contract verification`
- `da1ca46` - `fix: commit db contract artifacts`
- `be911c9` - `docs: allow explicit remote db verification`
