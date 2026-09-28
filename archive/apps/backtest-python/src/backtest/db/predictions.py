"""Reader and writer for the ``predictions`` hypertable.

Predictions are keyed by ``(model_id, ticker, time)`` so multiple models can
coexist for the same ticker. ``label`` is filled in retrospectively once the
forward-return window for that prediction closes; it must NOT be present when
the prediction is first written.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime

import pandas as pd
from psycopg.rows import dict_row

from .connection import connection


def upsert_predictions(
    rows: Iterable[tuple[datetime, int, str, float, float | None]],
    *,
    batch_size: int = 5_000,
) -> int:
    """Batch UPSERT into ``predictions``.

    Each row is ``(time, model_id, ticker, prediction, label)``. ``label`` may
    be ``None``. If a row already exists, ``prediction`` is overwritten but
    an existing non-null ``label`` is preserved (so retrospective label fills
    don't get clobbered by re-running a forward pass).
    """
    iterator = iter(rows)
    written = 0
    while True:
        batch: list[tuple[datetime, int, str, float, float | None]] = []
        for _ in range(batch_size):
            try:
                row = next(iterator)
            except StopIteration:
                break
            time, model_id, ticker, prediction, label = row
            batch.append((time, int(model_id), ticker, float(prediction), label))
        if not batch:
            break

        placeholders = ", ".join(["(%s, %s, %s, %s, %s)"] * len(batch))
        flat: list[object] = []
        for r in batch:
            flat.extend(r)

        statement = (
            'INSERT INTO public.predictions ("time", model_id, ticker, prediction, label) VALUES '
            + placeholders
            + " ON CONFLICT (model_id, ticker, \"time\") DO UPDATE SET "
            "  prediction = EXCLUDED.prediction, "
            "  label = COALESCE(EXCLUDED.label, public.predictions.label)"
        )

        with connection() as conn:
            with conn.cursor() as cur:
                cur.execute(statement, flat)
            conn.commit()

        written += len(batch)
    return written


def read_predictions(
    *,
    model_id: int,
    ticker: str,
    start: datetime | str | None = None,
    end: datetime | str | None = None,
) -> pd.DataFrame:
    """Read predictions for one model+ticker. Returns columns ``[prediction, label]``."""
    where = ["model_id = %(model_id)s", "ticker = %(ticker)s"]
    params: dict[str, object] = {"model_id": model_id, "ticker": ticker}
    if start is not None:
        where.append('"time" >= %(start)s')
        params["start"] = start
    if end is not None:
        where.append('"time" < %(end)s')
        params["end"] = end

    statement = (
        'SELECT "time", prediction, label FROM public.predictions '
        f"WHERE {' AND '.join(where)} "
        'ORDER BY "time" ASC'
    )

    with connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(statement, params)
            data = cur.fetchall()

    df = pd.DataFrame(data, columns=["time", "prediction", "label"])
    if df.empty:
        return df.set_index("time")
    df["time"] = pd.to_datetime(df["time"], utc=True)
    return df.set_index("time")
