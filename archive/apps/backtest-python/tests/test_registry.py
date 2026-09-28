"""Tests for the feature registry.

These tests are pure: no DB connection required.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from backtest.features.registry import (
    DEFAULT_RSI_PERIODS,
    FeatureSpec,
    default_rsi_specs,
    resolve,
    rsi_spec,
)


def _candles(n: int = 200) -> pd.DataFrame:
    rng = np.random.default_rng(7)
    idx = pd.date_range("2026-01-01", periods=n, freq="1min", tz="UTC")
    close = 100 + rng.standard_normal(n).cumsum()
    return pd.DataFrame({"close": close}, index=idx)


def test_rsi_spec_returns_named_series_aligned_to_input() -> None:
    df = _candles()
    spec = rsi_spec(14)

    out = spec.compute(df)

    assert isinstance(out, pd.Series)
    assert out.name == "rsi_14"
    assert out.index.equals(df.index)


def test_default_rsi_specs_match_default_periods() -> None:
    specs = default_rsi_specs()
    assert tuple(s.name for s in specs) == tuple(f"rsi_{p}" for p in DEFAULT_RSI_PERIODS)
    for spec in specs:
        assert isinstance(spec, FeatureSpec)


def test_resolve_returns_matching_spec() -> None:
    spec = resolve("rsi_28")
    assert spec.name == "rsi_28"

    df = _candles()
    out = spec.compute(df)
    assert out.iloc[:28].isna().all()


def test_resolve_rejects_unknown_feature() -> None:
    with pytest.raises(KeyError):
        resolve("not_a_feature")
    with pytest.raises(KeyError):
        resolve("rsi_abc")


def test_rsi_spec_rejects_invalid_period() -> None:
    with pytest.raises(ValueError):
        rsi_spec(1)


def test_compute_rejects_misaligned_series() -> None:
    df = _candles()

    def bad_builder(_: pd.DataFrame) -> pd.Series:
        return pd.Series([1.0, 2.0, 3.0])  # different index

    spec = FeatureSpec(name="bad", build=bad_builder)
    with pytest.raises(ValueError):
        spec.compute(df)
