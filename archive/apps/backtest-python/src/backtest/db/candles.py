"""Read-only access to canonical candle tables.

Canonical tables are owned by ``apps/write-node``. This module never writes to
them. See ``docs/project/roadmap.md`` for the full table contract.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime

import pandas as pd
from psycopg.rows import dict_row

from ..config import Timeframe, resolve_candle_table
from .connection import connection

# Columns shared by candles_1m_1s, candles_1h_1m, and (planned) candles_1d_1h.
# Matches the writer contract; see lib/db-timescale/generated/typescript/db-types.ts.
CANONICAL_CANDLE_COLUMNS: tuple[str, ...] = (
    "time",
    "ticker",
    "symbol",
    "open",
    "high",
    "low",
    "close",
    "volume",
    "ask_volume",
    "bid_volume",
    "cvd_open",
    "cvd_high",
    "cvd_low",
    "cvd_close",
    "vd",
    "vd_ratio",
    "book_imbalance",
    "price_pct",
    "divergence",
    "trades",
    "max_trade_size",
    "big_trades",
    "big_volume",
    "sum_bid_depth",
    "sum_ask_depth",
    "sum_price_volume",
    "unknown_volume",
)


def read_candles(
    ticker: str,
    timeframe: Timeframe,
    start: datetime | str | None = None,
    end: datetime | str | None = None,
    columns: Iterable[str] | None = None,
    limit: int | None = None,
) -> pd.DataFrame:
    """Load canonical candles for one ticker into a DataFrame.

    The returned frame is sorted ascending by ``time`` and indexed by ``time``.
    """
    table = resolve_candle_table(timeframe)
    selected = tuple(columns) if columns is not None else CANONICAL_CANDLE_COLUMNS
    selected_sql = ", ".join(f'"{c}"' for c in selected)

    where = ['ticker = %(ticker)s']
    params: dict[str, object] = {"ticker": ticker}
    if start is not None:
        where.append('"time" >= %(start)s')
        params["start"] = start
    if end is not None:
        where.append('"time" < %(end)s')
        params["end"] = end

    sql = (
        f"SELECT {selected_sql} FROM public.{table} "
        f"WHERE {' AND '.join(where)} "
        f'ORDER BY "time" ASC'
    )
    if limit is not None:
        sql += " LIMIT %(limit)s"
        params["limit"] = limit

    with connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(sql, params)
            data = cur.fetchall()

    df = pd.DataFrame(data, columns=list(selected))
    if df.empty:
        if "time" in df.columns:
            df = df.set_index("time")
        return df

    if "time" in df.columns:
        df["time"] = pd.to_datetime(df["time"], utc=True)
        df = df.set_index("time")
    return df
