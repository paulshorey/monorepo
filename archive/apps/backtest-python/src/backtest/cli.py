"""Typer-based CLI entry point.

Run with::

    uv run python -m backtest.cli read-candles --ticker ES --timeframe 1m_1s --limit 5
    uv run python -m backtest.cli build-features rsi --ticker ES --timeframe 1h_1m \
        --period 14 --start 2026-01-01 --end 2026-02-01
    uv run python -m backtest.cli read-features --ticker ES --timeframe 1h_1m \
        --feature rsi_14 --limit 10
"""

from __future__ import annotations

from datetime import datetime

import typer

from .config import CANONICAL_TIMEFRAMES, SUPPORTED_TICKER_SET, Timeframe

app = typer.Typer(help="Downstream feature, model, and backtest CLI.")


def _parse_dt(value: str | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromisoformat(value)


def _validate_timeframe(timeframe: str) -> Timeframe:
    if timeframe not in CANONICAL_TIMEFRAMES:
        raise typer.BadParameter(f"timeframe must be one of {CANONICAL_TIMEFRAMES}")
    return timeframe  # type: ignore[return-value]


def _warn_unknown_ticker(ticker: str) -> None:
    if ticker not in SUPPORTED_TICKER_SET:
        typer.echo(
            f"warning: ticker {ticker!r} is not in the configured ticker set", err=True
        )


@app.command("read-candles")
def read_candles_cmd(
    ticker: str = typer.Option(..., help="Ticker symbol, e.g. ES"),
    timeframe: str = typer.Option("1m_1s", help=f"One of {CANONICAL_TIMEFRAMES}"),
    start: str | None = typer.Option(None, help="ISO timestamp lower bound (inclusive)"),
    end: str | None = typer.Option(None, help="ISO timestamp upper bound (exclusive)"),
    limit: int | None = typer.Option(None, help="Optional row limit"),
) -> None:
    """Read canonical candles and print a small preview."""
    from .db.candles import read_candles

    _warn_unknown_ticker(ticker)
    tf = _validate_timeframe(timeframe)

    df = read_candles(
        ticker=ticker,
        timeframe=tf,
        start=_parse_dt(start),
        end=_parse_dt(end),
        limit=limit,
    )
    typer.echo(f"loaded {len(df)} row(s) for {ticker} {tf}")
    if not df.empty:
        typer.echo(df.head(10).to_string())


build_features_app = typer.Typer(help="Build and persist derived features.")
app.add_typer(build_features_app, name="build-features")


@build_features_app.command("rsi")
def build_features_rsi(
    ticker: str = typer.Option(..., help="Ticker symbol, e.g. ES"),
    timeframe: str = typer.Option(..., help=f"One of {CANONICAL_TIMEFRAMES}"),
    period: list[int] = typer.Option(
        [14],
        "--period",
        help="One or more RSI periods. Repeat the flag for multi-period RSI.",
    ),
    start: str | None = typer.Option(None, help="ISO timestamp lower bound (inclusive)"),
    end: str | None = typer.Option(None, help="ISO timestamp upper bound (exclusive)"),
) -> None:
    """Compute Wilder RSI on canonical candles and write into ``features_v1``."""
    from .features.builder import build_and_write_features
    from .features.registry import rsi_spec

    _warn_unknown_ticker(ticker)
    tf = _validate_timeframe(timeframe)

    if not period:
        raise typer.BadParameter("at least one --period is required")
    specs = tuple(rsi_spec(p) for p in period)

    results = build_and_write_features(
        ticker=ticker,
        timeframe=tf,
        specs=specs,
        start=_parse_dt(start),
        end=_parse_dt(end),
    )
    for r in results:
        typer.echo(
            f"{r.ticker} {r.timeframe} {r.feature}: "
            f"input={r.rows_input} written={r.rows_written}"
        )


@app.command("read-features")
def read_features_cmd(
    ticker: str = typer.Option(..., help="Ticker symbol, e.g. ES"),
    timeframe: str = typer.Option(..., help=f"One of {CANONICAL_TIMEFRAMES}"),
    feature: list[str] = typer.Option(
        ...,
        "--feature",
        help="Feature name to read (e.g. rsi_14). Repeat the flag for several.",
    ),
    start: str | None = typer.Option(None, help="ISO timestamp lower bound (inclusive)"),
    end: str | None = typer.Option(None, help="ISO timestamp upper bound (exclusive)"),
    limit: int | None = typer.Option(None, help="Optional row limit for preview"),
) -> None:
    """Read features in long format and print a small preview."""
    from .db.features import read_features

    _warn_unknown_ticker(ticker)
    tf = _validate_timeframe(timeframe)

    df = read_features(
        ticker=ticker,
        timeframe=tf,
        features=feature,
        start=_parse_dt(start),
        end=_parse_dt(end),
    )
    typer.echo(
        f"loaded {len(df)} feature row(s) for {ticker} {tf} features={feature}"
    )
    if not df.empty:
        head = df.head(limit) if limit is not None else df.head(10)
        typer.echo(head.to_string())


@app.command("train")
def train_cmd() -> None:
    """Placeholder for model training. See docs/project/backtest-python.md."""
    typer.echo("train not yet implemented; see docs/project/backtest-python.md")


@app.command("backtest")
def backtest_cmd() -> None:
    """Placeholder for backtest runner. See docs/project/backtest-python.md."""
    typer.echo("backtest not yet implemented; see docs/project/backtest-python.md")


def main() -> None:
    app()


if __name__ == "__main__":
    main()
