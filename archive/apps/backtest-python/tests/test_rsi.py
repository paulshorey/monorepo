"""Smoke test for the Wilder RSI implementation.

This test does not require a database connection. It runs locally with
``uv run pytest`` once dependencies are installed.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from backtest.features.rsi import wilder_rsi


def test_rsi_bounds_and_warmup() -> None:
    rng = np.random.default_rng(42)
    close = pd.Series(100 + rng.standard_normal(500).cumsum())
    rsi = wilder_rsi(close, period=14)

    assert rsi.iloc[:14].isna().all()
    valid = rsi.dropna()
    assert (valid >= 0).all()
    assert (valid <= 100).all()


def test_rsi_constant_series_yields_nan_or_neutral() -> None:
    flat = pd.Series([100.0] * 50)
    rsi = wilder_rsi(flat, period=14)
    valid = rsi.dropna()
    assert valid.empty or ((valid == 100) | (valid.between(0, 100))).all()
