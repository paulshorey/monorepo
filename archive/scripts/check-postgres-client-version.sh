#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <DATABASE_URL_ENV_VAR> <label> [--print-env]" >&2
}

extract_major() {
  local version_output="$1"
  printf '%s\n' "$version_output" \
    | sed -nE 's/.* ([0-9]+)(\.[0-9]+)?([[:space:]].*)?$/\1/p'
}

pick_highest_versioned_bin() {
  local command_name="$1"
  local candidates=()
  local latest=""

  shopt -s nullglob
  candidates=(/usr/lib/postgresql/*/bin/"${command_name}")
  shopt -u nullglob

  if [[ ${#candidates[@]} -eq 0 ]]; then
    return 1
  fi

  latest="$(
    printf '%s\n' "${candidates[@]}" \
      | sort -V \
      | sed -n '$p'
  )"

  if [[ -z "$latest" ]]; then
    return 1
  fi

  printf '%s\n' "$latest"
}

if [[ $# -lt 2 || $# -gt 3 ]]; then
  usage
  exit 1
fi

database_url_env="$1"
label="$2"
print_env="${3:-}"

if [[ -n "$print_env" && "$print_env" != "--print-env" ]]; then
  usage
  exit 1
fi

database_url="${!database_url_env:-}"
if [[ -z "$database_url" ]]; then
  echo "${database_url_env} is required" >&2
  exit 1
fi

probe_psql=""
if ! probe_psql="$(pick_highest_versioned_bin psql)"; then
  if command -v psql >/dev/null 2>&1; then
    probe_psql="$(command -v psql)"
  fi
fi

if [[ -z "$probe_psql" ]]; then
  cat >&2 <<'EOF'
PostgreSQL client tools are required to verify DB contracts.

Install both `psql` and `pg_dump`, and make sure they match the same major
version as the target database server before rerunning the command.

Examples:
  Ubuntu/Debian:
    sudo apt-get install -y postgresql-common ca-certificates
    sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
    sudo apt-get install -y postgresql-client-17

  Homebrew:
    brew install postgresql@17

If Debian/Ubuntu installs multiple PostgreSQL client majors, the versioned
binaries under `/usr/lib/postgresql/<major>/bin/` avoid wrapper mismatches.
EOF
  exit 1
fi

server_major="$(
  "$probe_psql" "$database_url" -Atqc "SELECT current_setting('server_version_num')::int / 10000"
)"
if [[ -z "$server_major" ]]; then
  echo "Unable to determine PostgreSQL server major version for ${label}" >&2
  exit 1
fi

psql_bin="/usr/lib/postgresql/${server_major}/bin/psql"
pg_dump_bin="/usr/lib/postgresql/${server_major}/bin/pg_dump"

if [[ ! -x "$psql_bin" ]]; then
  if command -v psql >/dev/null 2>&1; then
    psql_bin="$(command -v psql)"
  else
    psql_bin="$probe_psql"
  fi
fi

if [[ ! -x "$pg_dump_bin" ]]; then
  if command -v pg_dump >/dev/null 2>&1; then
    pg_dump_bin="$(command -v pg_dump)"
  else
    pg_dump_bin=""
  fi
fi

if [[ -z "$pg_dump_bin" || ! -x "$pg_dump_bin" ]]; then
  echo "Unable to locate pg_dump for ${label}" >&2
  exit 1
fi

psql_version="$("$psql_bin" --version)"
pg_dump_version="$("$pg_dump_bin" --version)"
psql_major="$(extract_major "$psql_version")"
pg_dump_major="$(extract_major "$pg_dump_version")"

if [[ -z "$psql_major" || -z "$pg_dump_major" ]]; then
  echo "Unable to determine PostgreSQL client major versions for ${label}" >&2
  exit 1
fi

if [[ "$psql_major" != "$server_major" || "$pg_dump_major" != "$server_major" ]]; then
  cat >&2 <<EOF
PostgreSQL client/server major version mismatch for ${label}.

  server major: ${server_major}
  psql: ${psql_version} (${psql_bin})
  pg_dump: ${pg_dump_version} (${pg_dump_bin})

Install PostgreSQL client ${server_major} locally so schema snapshots match the
PostgreSQL ${server_major} service containers used in CI.

Examples:
  Ubuntu/Debian:
    sudo apt-get install -y postgresql-common ca-certificates
    sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
    sudo apt-get install -y postgresql-client-${server_major}

  Homebrew:
    brew install postgresql@${server_major}

After installation, ensure `psql` and `pg_dump` resolve to PostgreSQL
${server_major}, or invoke the versioned binaries under
`/usr/lib/postgresql/${server_major}/bin/` directly.
EOF
  exit 1
fi

echo "Using ${psql_version} at ${psql_bin} against ${label} server major ${server_major}" >&2
echo "Using ${pg_dump_version} at ${pg_dump_bin}" >&2

if [[ "$print_env" == "--print-env" ]]; then
  printf 'export CURSOR_POSTGRES_SERVER_MAJOR=%q\n' "$server_major"
  printf 'export CURSOR_POSTGRES_PSQL=%q\n' "$psql_bin"
  printf 'export CURSOR_POSTGRES_PG_DUMP=%q\n' "$pg_dump_bin"
fi
