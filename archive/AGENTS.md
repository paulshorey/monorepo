# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# This project is a monorepo of trading and financial data apps. It uses TurboRepo to build, test, and deploy.

## Folder structure

### Apps `./apps/`

- `write-node` - canonical timeseries writer. Ingests TBBO trade data (Databento live + historical files), stitches front-month contracts, computes per-row CVD/VD/book imbalance, and writes rolling candle tables to TimescaleDB.
- `view-next` - financial charting app for price + relative-strength visualization.
- `tradingview-node` - Express API for TradingView webhook ingest and strength reads.
- `log-next` - logging and observability dashboard.
- `backtest-python` - Python research app for downstream feature engineering, ML training, and backtesting on top of `write-node` canonical tables. Reads from TimescaleDB; writes its own derived feature/model/backtest tables.

### Shared Libraries `./lib/`

- `common` shared utilities
- `config` shared tooling
- `db-trading` database contracts for TRADING_DB
- `db-timescale` database contracts for TIMESCALE_DB

## DB package contract model

For each DB package:

- `migrations/` = canonical migration history
- `schema/current.sql` = generated schema snapshot
- `queries/` = language-agnostic SQL contracts
- `generated/` = generated artifacts for language clients
- runtime adapters live in `sql/*` and/or `lib/db/*`

## Import and boundary rules

In apps:

- Use `@/` for same-app imports.
- Use `@lib/common/...` for shared non-DB utilities.
- Use `@lib/db-trading/...` and `@lib/db-timescale/...` for DB contracts/helpers.

In `lib/*` packages:

- Use relative imports.
- Do not rewrite import paths unless files were moved.

## Operational rules for agent work

- Always use `pnpm` (never `npm`)
- Use `pnpm --filter <app> <command>` or `cd apps/<app> && pnpm run <command>`
- Never add `pnpm install` / `pnpm i` inside package-level `build`, `dev`, `test`, or `start` scripts. Install dependencies from the workspace root only.
- For focused work on one app or package, install from the root with a filter that includes that target plus its workspace dependencies, for example:
  - `pnpm run deps:install -- view-next...`
  - `pnpm run deps:install -- @lib/config...`
- Use a full root install (`pnpm run deps:install`) when running repo-wide commands such as `pnpm build`, when touching multiple apps, or when changing shared workspace dependencies.
- If request is ambiguous or contradictory, ask for clarification

## Remote DB:

The current environment is only development. It's experimental. So, feel free to make changes to the remote deployed database. Migrations, breaking changes, destructive changes are ALL OK! This is not production.

- `db:migrate` writes to the target database.
- `db:verify` verifies that it was migrated correctly.
- Run both after making changes to the database schema, table structure, indexes, new tables, etc.
- Before running against a deployed DB, confirm the environment variable is present, the host is reachable from the cloud agent, and there are no unexpected pending migrations.

Run `cloud:install` to install PostgreSQL 17 client tools (psql, pg_dump) if not already installed.

## Finish task:

- Run `pnpm build`, fix issues, then run `pnpm build` again until there are no more issues to fix.

## App boundaries

- `write-node` owns canonical timeseries writes only. It does not own indicators
  beyond per-row structural metrics (CVD, VD, book imbalance, divergence) and
  does not own ML feature engineering.
- `backtest-python` owns derived feature engineering, multi-period indicators
  (RSI, etc.), ML training/inference, and backtests. It reads canonical tables
  and writes its own feature/model/backtest tables.
- `view-next` and `log-next` are read-only consumers; they do not write
  canonical or derived tables.

## Project planning

High-level plans live under `./docs/project/`:

- `docs/project/roadmap.md` - phased roadmap across all apps
- `docs/project/write-node-completion.md` - finishing the canonical writer
- `docs/project/backtest-python.md` - architecture and implementation plan
  for the Python research app

Keep these docs short and aligned with the apps that actually exist.

## AGENTS maintenance

- Read local `AGENTS.md` in the folder you edit, when present.
- Keep AGENTS.md files aligned with actual architecture.
- Remove outdated or incorrect instructions.
- Documentation should be concise and minimal.
