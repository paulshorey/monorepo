"""Stable registry of feature builders.

Every feature persisted in ``features_v1`` is identified by a stable string
``feature`` value. The registry maps that name to a function that takes a
candle DataFrame indexed by ``time`` and returns a ``pd.Series`` aligned to
the same index.

Conventions:

- Names are lower_snake_case and include their parameters where they vary
  (e.g. ``rsi_14``, ``rsi_28``).
- Builder functions must be **causal**: the value at ``time t`` may only
  depend on inputs at ``time t' <= t``. No look-ahead.
- A builder may return NaN for warmup rows; the writer will skip them so the
  feature table is never populated with NaN values.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

import pandas as pd

from .rsi import wilder_rsi

FeatureFn = Callable[[pd.DataFrame], pd.Series]


@dataclass(frozen=True)
class FeatureSpec:
    """Resolved feature: a stable name plus the function that computes it."""

    name: str
    build: FeatureFn

    def compute(self, candles: pd.DataFrame) -> pd.Series:
        series = self.build(candles)
        if not isinstance(series, pd.Series):
            raise TypeError(f"feature {self.name!r} did not return a pd.Series")
        if series.index is not candles.index and not series.index.equals(candles.index):
            raise ValueError(
                f"feature {self.name!r} returned a series with a different index than its input"
            )
        return series.rename(self.name)


def _rsi_builder(period: int) -> FeatureFn:
    if period <= 1:
        raise ValueError("RSI period must be >= 2")

    def build(candles: pd.DataFrame) -> pd.Series:
        if "close" not in candles.columns:
            raise KeyError("candles DataFrame must contain a 'close' column")
        return wilder_rsi(candles["close"], period=period)

    build.__name__ = f"rsi_{period}_builder"
    return build


def rsi_spec(period: int) -> FeatureSpec:
    """Convenience constructor for the canonical RSI feature."""
    return FeatureSpec(name=f"rsi_{period}", build=_rsi_builder(period))


# Default canonical periods used by the multi-timeframe RSI feature set.
DEFAULT_RSI_PERIODS: tuple[int, ...] = (7, 14, 28)


def default_rsi_specs(periods: tuple[int, ...] = DEFAULT_RSI_PERIODS) -> tuple[FeatureSpec, ...]:
    return tuple(rsi_spec(p) for p in periods)


def resolve(feature_name: str) -> FeatureSpec:
    """Resolve a feature name (e.g. ``rsi_14``) to its FeatureSpec.

    Raises ``KeyError`` for unknown features.
    """
    if feature_name.startswith("rsi_"):
        try:
            period = int(feature_name.removeprefix("rsi_"))
        except ValueError as exc:
            raise KeyError(f"unknown feature: {feature_name!r}") from exc
        return rsi_spec(period)
    raise KeyError(f"unknown feature: {feature_name!r}")
