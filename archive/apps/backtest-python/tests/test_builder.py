"""Tests for the feature build orchestrator.

The orchestrator must be usable without a database connection. We exercise
``compute_feature_series`` directly and ``build_and_write_features`` by
patching the DB read/write functions.
"""

from __future__ import annotations

from unittest.mock import patch

import numpy as np
import pandas as pd

from backtest.features.builder import (
    build_and_write_features,
    compute_feature_series,
)
from backtest.features.registry import rsi_spec


def _candles(n: int = 100) -> pd.DataFrame:
    rng = np.random.default_rng(13)
    idx = pd.date_range("2026-01-01", periods=n, freq="1min", tz="UTC")
    close = 50 + rng.standard_normal(n).cumsum()
    return pd.DataFrame({"close": close}, index=idx)


def test_compute_feature_series_pure_no_db() -> None:
    df = _candles()
    series = compute_feature_series(df, rsi_spec(14))

    assert series.name == "rsi_14"
    assert series.iloc[:14].isna().all()
    valid = series.dropna()
    assert (valid >= 0).all()
    assert (valid <= 100).all()


def test_build_and_write_features_skips_warmup_nans() -> None:
    df = _candles(n=50)
    captured: dict[str, object] = {}

    def fake_upsert(series, *, ticker, timeframe, feature, batch_size=5_000):
        captured["len"] = len(series)
        captured["feature"] = feature
        captured["ticker"] = ticker
        captured["timeframe"] = timeframe
        return len(series)

    with patch("backtest.db.features.upsert_feature_series", side_effect=fake_upsert):
        results = build_and_write_features(
            ticker="ES",
            timeframe="1m_1s",
            specs=(rsi_spec(14),),
            candles=df,
        )

    assert len(results) == 1
    r = results[0]
    assert r.ticker == "ES"
    assert r.timeframe == "1m_1s"
    assert r.feature == "rsi_14"
    assert r.rows_input == 50
    # Warmup of 14 means at most 50 - 14 valid rows; writer must never see NaNs.
    assert r.rows_written <= 50 - 14
    assert captured["len"] == r.rows_written
    assert captured["feature"] == "rsi_14"


def test_build_and_write_features_handles_empty_input() -> None:
    empty = pd.DataFrame(
        columns=["close"], index=pd.DatetimeIndex([], tz="UTC", name="time")
    )

    with patch("backtest.db.features.upsert_feature_series") as mock_upsert:
        results = build_and_write_features(
            ticker="ES",
            timeframe="1m_1s",
            specs=(rsi_spec(14),),
            candles=empty,
        )

    mock_upsert.assert_not_called()
    assert len(results) == 1
    assert results[0].rows_input == 0
    assert results[0].rows_written == 0


def test_build_and_write_features_runs_multiple_specs() -> None:
    df = _candles(n=120)
    seen: list[str] = []

    def fake_upsert(series, *, ticker, timeframe, feature, batch_size=5_000):
        seen.append(feature)
        return len(series)

    with patch("backtest.db.features.upsert_feature_series", side_effect=fake_upsert):
        results = build_and_write_features(
            ticker="NQ",
            timeframe="1h_1m",
            specs=(rsi_spec(7), rsi_spec(14), rsi_spec(28)),
            candles=df,
        )

    assert seen == ["rsi_7", "rsi_14", "rsi_28"]
    assert [r.feature for r in results] == ["rsi_7", "rsi_14", "rsi_28"]
