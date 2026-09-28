"""Model registry helpers.

Reads/writes ``public.models``. ``(name, version)`` is unique; calling
``register_model`` with the same pair updates ``params``, ``metrics``, and
``artifact_uri`` and returns the existing id, so research scripts can be
re-run idempotently.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from psycopg.rows import dict_row

from .connection import connection


@dataclass(frozen=True)
class Model:
    id: int
    name: str
    version: str
    params: dict[str, Any]
    metrics: dict[str, Any]
    artifact_uri: str | None
    created_at: datetime


def register_model(
    *,
    name: str,
    version: str,
    params: dict[str, Any],
    metrics: dict[str, Any],
    artifact_uri: str | None = None,
) -> int:
    """Insert-or-update a model by ``(name, version)`` and return its id."""
    statement = (
        "INSERT INTO public.models (name, version, params, metrics, artifact_uri) "
        "VALUES (%s, %s, %s::jsonb, %s::jsonb, %s) "
        "ON CONFLICT (name, version) DO UPDATE SET "
        "  params = EXCLUDED.params, "
        "  metrics = EXCLUDED.metrics, "
        "  artifact_uri = EXCLUDED.artifact_uri "
        "RETURNING id"
    )
    with connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                statement,
                (
                    name,
                    version,
                    json.dumps(params),
                    json.dumps(metrics),
                    artifact_uri,
                ),
            )
            row = cur.fetchone()
        conn.commit()
    if row is None:
        raise RuntimeError("models insert did not return an id")
    return int(row[0])


def get_model(*, name: str, version: str) -> Model | None:
    statement = (
        "SELECT id, name, version, params, metrics, artifact_uri, created_at "
        "FROM public.models WHERE name = %s AND version = %s"
    )
    with connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(statement, (name, version))
            row = cur.fetchone()
    if row is None:
        return None
    return Model(
        id=int(row["id"]),
        name=row["name"],
        version=row["version"],
        params=row["params"],
        metrics=row["metrics"],
        artifact_uri=row["artifact_uri"],
        created_at=row["created_at"],
    )
