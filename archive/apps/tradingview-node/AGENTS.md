# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# TradingView Node Service

Express service that owns the TradingView strength API previously hosted in `view-next`.

## Endpoints

- `POST /api/v1/tradingview`: accepts TradingView text payload and writes strength data.
- `GET /api/v1/tradingview`: reads `strength_v1` rows with optional query filters.
- `GET /health`: basic liveness check.

## Testing

- **Framework**: Node.js built-in test runner (`node:test`) + supertest for HTTP assertions. No additional test framework.
- **Run**: `pnpm test` (or `pnpm --filter tradingview-node test` from repo root).
- **Setup**: `src/test/setup.ts` runs via `--import` before tests; sets `TRADING_DB_URL` placeholder so db module does not throw. `NODE_ENV=test` prevents the server from starting when importing `createApp` for tests.
- **Mock data**: `src/test/mockData.ts` exports `mockStrengthRows` (GET), `mockInvalidPostBody`, `mockValidPostBody`, `mockValidStrengthData`, `mockStrengthAddResult` (POST). Uses types from `src/types/strength.ts`.
- **Testability**: `createApp(options?)` accepts `getStrengthRows`, `strengthAdd`, `sqlLogAdd` overrides. `createGetTradingView(deps)` and `createPostTradingView(deps)` receive injected deps. POST tests use `noOpSqlLogAdd` to avoid DB/SMS during validation-error paths.

## Railway Deployment

Deploy as a **shared monorepo** (do not set Root Directory—the service depends on `@lib/common`):

1. **Root Directory**: Leave empty (deploy from repo root). If set to `apps/tradingview-node`, pnpm workspace filters fail with "No projects matched the filters".
2. **Host binding**: Server must listen on `0.0.0.0` (Railway routing requires it; `::` or localhost will cause 502).
3. **Config**: `railway.json` in this directory defines build/start commands. In Railway service settings, set "Config path" to `apps/tradingview-node/railway.json` if it isn't auto-detected.
4. **Install**: Default Railpack Node install (`pnpm install`) works when deploying from repo root. Remove `RAILPACK_INSTALL_COMMAND` (or use `RAILPACK_INSTALL_CMD` if you need a custom install).

## Notes

- Keep route behavior compatible with prior Next.js API contract (`ok`, `status`, `rows`, `error`).
- Route handlers are split into `src/handlers/tradingview/` and mounted from `src/routes/tradingview.ts`.
- Strength parsing/read/write logic is centralized in `src/services/strength.ts`.
- Shared types and utilities are in `src/types/strength.ts` and `src/lib/*`.
- Invalid TradingView payloads and runtime handler failures should be logged via `sqlLogAdd` (`@lib/db-trading/sql/log/add`) for observability.
- Route handlers should enrich log `stack` with request metadata (including IP context) before calling `sqlLogAdd`.
- Alerting behavior (SMS for warn/error paths) is application logic and should be handled in handlers, not in `@lib/db-trading`.
- Reusable request-aware logging glue for Express handlers lives in `src/lib/logging.ts` (`logRequestEvent`).
- In-app imports should use the `@` alias (configured as `@/* -> ./*` in `tsconfig.json`) instead of deep relative paths like `../../` and `../../../`.
