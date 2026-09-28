# Generated Language Artifacts

This directory stores generated outputs derived from migration/schema/query
contracts.

Suggested targets:

- `typescript/`
- `python/`
- `csharp/`
- `r/`

Do not treat generated code as the source of truth.

## Current generated outputs

- `typescript/db-types.ts` - generated row interfaces and table map
- `contracts/db-schema.json` - machine-readable schema contract for other language tooling

## Regenerate

- `pnpm --filter @lib/db-trading db:types:generate`
