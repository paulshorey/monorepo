"""Reader and writer for ``features_v1`` (long-format feature timeseries).

Schema lives in ``@lib/db-timescale/migrations/202605072300__add_backtest_python_tables.sql``.

Long format keeps the writer schema-stable: adding a new feature adds rows,
never columns.

Wide-format access for downstream notebooks/ML is provided by
``read_features_wide``, which pivots a long-format result.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from datetime import datetime

import pandas as pd
from psycopg.rows import dict_row

from ..config import Timeframe
from .connection import connection

FEATURE_TIMEFRAME_VALUES: tuple[Timeframe, ...] = ("1m_1s", "1h_1m", "1d_1h")


def upsert_features(
    rows: Iterable[tuple[datetime, str, str, str, float | None]],
    *,
    batch_size: int = 5_000,
) -> int:
    """Batch UPSERT into ``features_v1``.

    Each row is ``(time, ticker, timeframe, feature, value)``. Rows with NaN
    or ``None`` value are skipped — the feature table is never populated with
    NaN.

    Returns the total number of rows actually written.
    """
    iterator = iter(rows)
    written = 0
    while True:
        batch = []
        for _ in range(batch_size):
            try:
                row = next(iterator)
            except StopIteration:
                break
            time, ticker, timeframe, feature, value = row
            if value is None:
                continue
            try:
                if value != value:  # NaN check without numpy import
                    continue
            except TypeError:
                continue
            batch.append((time, ticker, timeframe, feature, float(value)))
        if not batch:
            break

        placeholders = ", ".join(["(%s, %s, %s, %s, %s)"] * len(batch))
        flat: list[object] = []
        for r in batch:
            flat.extend(r)

        statement = (
            'INSERT INTO public.features_v1 ("time", ticker, timeframe, feature, value) VALUES '
            + placeholders
            + ' ON CONFLICT (ticker, timeframe, feature, "time")'
            + " DO UPDATE SET value = EXCLUDED.value"
        )

        with connection() as conn:
            with conn.cursor() as cur:
                cur.execute(statement, flat)
            conn.commit()

        written += len(batch)
    return written


def upsert_feature_series(
    series: pd.Series,
    *,
    ticker: str,
    timeframe: Timeframe,
    feature: str,
    batch_size: int = 5_000,
) -> int:
    """Convenience wrapper: write a Series indexed by ``time`` into ``features_v1``.

    NaN values are skipped automatically.
    """
    if not isinstance(series.index, pd.DatetimeIndex):
        raise TypeError("series must be indexed by a DatetimeIndex (UTC)")

    def gen():
        for ts, value in series.items():
            yield (ts.to_pydatetime(), ticker, timeframe, feature, value)

    return upsert_features(gen(), batch_size=batch_size)


def read_features(
    *,
    ticker: str,
    timeframe: Timeframe,
    features: Sequence[str] | None = None,
    start: datetime | str | None = None,
    end: datetime | str | None = None,
) -> pd.DataFrame:
    """Long-format read: returns columns ``[time, feature, value]``.

    ``features=None`` reads all features for that (ticker, timeframe).
    """
    where = ['ticker = %(ticker)s', 'timeframe = %(timeframe)s']
    params: dict[str, object] = {"ticker": ticker, "timeframe": timeframe}

    if features is not None:
        feature_list = list(features)
        if not feature_list:
            return pd.DataFrame(columns=["time", "feature", "value"]).set_index("time")
        where.append("feature = ANY(%(features)s)")
        params["features"] = feature_list

    if start is not None:
        where.append('"time" >= %(start)s')
        params["start"] = start
    if end is not None:
        where.append('"time" < %(end)s')
        params["end"] = end

    statement = (
        'SELECT "time", feature, value FROM public.features_v1 '
        f"WHERE {' AND '.join(where)} "
        'ORDER BY "time" ASC'
    )

    with connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(statement, params)
            data = cur.fetchall()

    df = pd.DataFrame(data, columns=["time", "feature", "value"])
    if df.empty:
        return df.set_index("time")
    df["time"] = pd.to_datetime(df["time"], utc=True)
    return df.set_index("time")


def read_features_wide(
    *,
    ticker: str,
    timeframe: Timeframe,
    features: Sequence[str],
    start: datetime | str | None = None,
    end: datetime | str | None = None,
) -> pd.DataFrame:
    """Wide-format read: one column per requested feature, indexed by time.

    Convenient for joining against canonical candles in notebooks and feature
    vectors for ML training.
    """
    long = read_features(
        ticker=ticker, timeframe=timeframe, features=features, start=start, end=end
    )
    if long.empty:
        return pd.DataFrame(columns=list(features))
    wide = long.pivot(columns="feature", values="value")
    # Preserve requested column order; add NaN columns for any missing features.
    for f in features:
        if f not in wide.columns:
            wide[f] = float("nan")
    return wide.loc[:, list(features)].sort_index()


__all__ = [
    "FEATURE_TIMEFRAME_VALUES",
    "read_features",
    "read_features_wide",
    "upsert_feature_series",
    "upsert_features",
]
