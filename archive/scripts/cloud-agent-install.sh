#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export CI="${CI:-true}"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export HUSKY="${HUSKY:-0}"
export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
STORE_DIR="${PNPM_STORE_DIR:-$ROOT_DIR/.pnpm-store}"
PG17_BINDIR="/usr/lib/postgresql/17/bin"

mkdir -p "$ROOT_DIR/.turbo" "$PNPM_HOME" "$STORE_DIR"

case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

bash scripts/install-workspace-deps.sh "$@"

# Install PostgreSQL 17 client tools (psql, pg_dump) for db:migrate and db:verify
has_pg17_clients() {
  if [[ -x "${PG17_BINDIR}/psql" && -x "${PG17_BINDIR}/pg_dump" ]]; then
    return 0
  fi

  if ! command -v psql >/dev/null 2>&1 || ! command -v pg_dump >/dev/null 2>&1; then
    return 1
  fi

  psql --version | grep -qE '\b17(\.|[[:space:]])' \
    && pg_dump --version | grep -qE '\b17(\.|[[:space:]])'
}

need_pg17=false
if ! has_pg17_clients; then
  need_pg17=true
fi
if [[ "$need_pg17" == "true" ]]; then
  echo "Installing PostgreSQL 17 client tools..."
  sudo apt-get update -qq
  sudo apt-get install -y postgresql-common ca-certificates
  sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
  sudo apt-get install -y postgresql-client-17
fi

if [[ -x "${PG17_BINDIR}/pg_dump" ]]; then
  echo "PostgreSQL client tools ready: $("${PG17_BINDIR}/pg_dump" --version)"
elif command -v pg_dump >/dev/null 2>&1; then
  echo "PostgreSQL client tools ready: $(pg_dump --version)"
fi

pnpm fetch --store-dir "$STORE_DIR"
pnpm install --frozen-lockfile --prefer-offline --store-dir "$STORE_DIR"
