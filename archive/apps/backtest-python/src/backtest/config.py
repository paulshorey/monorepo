"""Static configuration: tickers, timeframes, table names.

Keep this module side-effect-free. Runtime config (DB URL, etc.) is read from
environment variables in ``backtest.db.connection``.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

Timeframe = Literal["1m_1s", "1h_1m", "1d_1h"]

CANONICAL_TIMEFRAMES: tuple[Timeframe, ...] = ("1m_1s", "1h_1m", "1d_1h")

CANDLE_TABLE_BY_TIMEFRAME: dict[Timeframe, str] = {
    "1m_1s": "candles_1m_1s",
    "1h_1m": "candles_1h_1m",
    "1d_1h": "candles_1d_1h",
}


@dataclass(frozen=True)
class TickerConfig:
    ticker: str
    market: str
    session_profile: str


SUPPORTED_TICKERS: tuple[TickerConfig, ...] = (
    TickerConfig("ES", "E-mini S&P 500", "globex"),
    TickerConfig("NQ", "E-mini Nasdaq-100", "globex"),
    TickerConfig("GC", "Gold", "globex"),
    TickerConfig("SI", "Silver", "globex"),
    TickerConfig("HG", "Copper", "globex"),
    TickerConfig("CL", "WTI Crude", "globex"),
)

SUPPORTED_TICKER_SET: frozenset[str] = frozenset(t.ticker for t in SUPPORTED_TICKERS)


def resolve_candle_table(timeframe: Timeframe) -> str:
    try:
        return CANDLE_TABLE_BY_TIMEFRAME[timeframe]
    except KeyError as exc:
        raise ValueError(f"unknown canonical timeframe: {timeframe!r}") from exc
