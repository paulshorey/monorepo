"""Multi-timeframe RSI computed on canonical candle ``close`` series.

This is the first concrete feature for the downstream pipeline. Compute it
independently on each canonical timeframe (1m_1s, 1h_1m, 1d_1h) and persist
each as its own row in ``features_v1`` keyed by
``(ticker, timeframe, feature, time)``.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def wilder_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    """Wilder's RSI on a close-price series.

    The first ``period`` values are NaN (insufficient history). No look-ahead;
    each value at time ``t`` only depends on prices at ``t' <= t``.
    """
    if period <= 1:
        raise ValueError("RSI period must be >= 2")

    delta = close.diff()
    gains = delta.clip(lower=0.0)
    losses = -delta.clip(upper=0.0)

    avg_gain = gains.ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean()
    avg_loss = losses.ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean()

    rs = avg_gain / avg_loss.replace(0.0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    rsi = rsi.where(avg_loss != 0.0, 100.0)
    return rsi.rename(f"rsi_{period}")


def feature_name(period: int) -> str:
    """Stable feature name used in ``features_v1.feature``."""
    return f"rsi_{period}"
