"""Append-only backtest run log.

Writes ``public.backtests``. Unlike the model registry, every call to
``record_backtest`` produces a new row so historical artifacts are preserved.
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from .connection import connection


def record_backtest(
    *,
    strategy: str,
    ticker: str,
    range_start: datetime,
    range_end: datetime,
    params: dict[str, Any],
    metrics: dict[str, Any],
    model_id: int | None = None,
) -> int:
    """Insert a backtest row and return its id."""
    statement = (
        "INSERT INTO public.backtests "
        "(model_id, strategy, ticker, range_start, range_end, params, metrics) "
        "VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s::jsonb) "
        "RETURNING id"
    )
    with connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                statement,
                (
                    model_id,
                    strategy,
                    ticker,
                    range_start,
                    range_end,
                    json.dumps(params),
                    json.dumps(metrics),
                ),
            )
            row = cur.fetchone()
        conn.commit()
    if row is None:
        raise RuntimeError("backtests insert did not return an id")
    return int(row[0])
