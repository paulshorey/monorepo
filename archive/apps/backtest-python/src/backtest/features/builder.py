"""End-to-end feature build orchestration.

A "build" reads canonical candles for one (ticker, timeframe), runs one or
more registered feature builders, and writes the resulting series into
``features_v1``.

The orchestrator is designed so the same in-memory codepath is used by:

- the CLI (``python -m backtest.cli build-features rsi ...``),
- notebooks (call ``compute_feature_series`` directly to inspect output before
  writing), and
- a future scheduled job (live recompute of the latest window).

This separation keeps the writer dumb and makes feature logic trivially
testable without a database connection.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from datetime import datetime

import pandas as pd

from ..config import Timeframe
from .registry import FeatureSpec


@dataclass(frozen=True)
class FeatureBuildResult:
    ticker: str
    timeframe: Timeframe
    feature: str
    rows_input: int
    rows_written: int


def compute_feature_series(
    candles: pd.DataFrame,
    spec: FeatureSpec,
) -> pd.Series:
    """Pure function: candles + spec -> Series. No DB, no side effects.

    Used directly by tests and notebooks; the build pipeline composes this
    with ``read_candles`` and ``upsert_feature_series``.
    """
    return spec.compute(candles)


def build_and_write_features(
    *,
    ticker: str,
    timeframe: Timeframe,
    specs: Sequence[FeatureSpec],
    start: datetime | str | None = None,
    end: datetime | str | None = None,
    candles: pd.DataFrame | None = None,
) -> list[FeatureBuildResult]:
    """Read canonical candles (if not supplied), compute every feature in
    ``specs``, and UPSERT each into ``features_v1``.

    Imports are local to keep ``compute_feature_series`` usable in environments
    without a database (notebook smoke tests, unit tests).
    """
    from ..db.candles import read_candles
    from ..db.features import upsert_feature_series

    if candles is None:
        candles = read_candles(ticker=ticker, timeframe=timeframe, start=start, end=end)

    results: list[FeatureBuildResult] = []
    if candles.empty:
        for spec in specs:
            results.append(
                FeatureBuildResult(
                    ticker=ticker,
                    timeframe=timeframe,
                    feature=spec.name,
                    rows_input=0,
                    rows_written=0,
                )
            )
        return results

    for spec in specs:
        series = compute_feature_series(candles, spec)
        clean = series.dropna()
        written = 0
        if not clean.empty:
            written = upsert_feature_series(
                clean, ticker=ticker, timeframe=timeframe, feature=spec.name
            )
        results.append(
            FeatureBuildResult(
                ticker=ticker,
                timeframe=timeframe,
                feature=spec.name,
                rows_input=len(candles),
                rows_written=written,
            )
        )
    return results


def iter_multi_timeframe(
    timeframes: Iterable[Timeframe],
) -> Iterable[Timeframe]:
    """Stable iteration helper used by the CLI to build features across all
    canonical timeframes for a single ticker in one call.
    """
    seen: set[str] = set()
    for tf in timeframes:
        if tf not in seen:
            seen.add(tf)
            yield tf
