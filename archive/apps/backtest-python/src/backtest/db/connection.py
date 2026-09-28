"""TimescaleDB connection helpers.

Reads ``TIMESCALE_DB_URL`` from the environment, the same variable used by
``apps/write-node`` and ``@lib/db-timescale``.
"""

from __future__ import annotations

import os
from collections.abc import Iterator
from contextlib import contextmanager

import psycopg
from psycopg_pool import ConnectionPool

_ENV_VAR = "TIMESCALE_DB_URL"
_pool: ConnectionPool | None = None


def _get_dsn() -> str:
    dsn = os.environ.get(_ENV_VAR)
    if not dsn:
        raise RuntimeError(
            f"environment variable {_ENV_VAR} is not set; "
            "point it at the same TimescaleDB used by write-node"
        )
    return dsn


def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = ConnectionPool(conninfo=_get_dsn(), min_size=1, max_size=4, open=True)
    return _pool


@contextmanager
def connection() -> Iterator[psycopg.Connection]:
    pool = get_pool()
    with pool.connection() as conn:
        yield conn


def close_pool() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None
