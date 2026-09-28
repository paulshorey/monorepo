#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export COREPACK_ENABLE_DOWNLOAD_PROMPT="${COREPACK_ENABLE_DOWNLOAD_PROMPT:-0}"
export CI="${CI:-true}"
export HUSKY="${HUSKY:-0}"
export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
STORE_DIR="${PNPM_STORE_DIR:-$ROOT_DIR/.pnpm-store}"

mkdir -p "$PNPM_HOME" "$STORE_DIR" "$ROOT_DIR/.turbo"

case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

corepack enable
corepack prepare pnpm@10.28.1 --activate

FILTER_ARGS=()
if (($# > 0)) && [[ "$1" == "--" ]]; then
  shift
fi

if (($# > 0)); then
  for filter in "$@"; do
    FILTER_ARGS+=(--filter "$filter")
  done
  echo "Installing workspace dependencies for filters: $*"
else
  echo "Installing workspace dependencies for all packages"
fi

pnpm fetch --store-dir "$STORE_DIR" "${FILTER_ARGS[@]}"
pnpm install --frozen-lockfile --prefer-offline --store-dir "$STORE_DIR" "${FILTER_ARGS[@]}"
