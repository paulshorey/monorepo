"""Local Databento TBBO CSV ingestion and observed trade-minute aggregation."""
import csv
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path
import re
from strategy_core import Bar, Instrument

ROOT = Path(__file__).resolve().parents[4]
MANIFESTS = ROOT / "data/manifests"
CACHE = ROOT / "data/databento"
ID = re.compile(r"[a-z0-9][a-z0-9_-]{0,79}\Z")
REQUIRED = {"ts_event", "ts_recv", "instrument_id", "symbol", "action", "side", "price", "size",
            "bid_px_00", "ask_px_00", "bid_sz_00", "ask_sz_00"}


def validate_id(value: str) -> str:
    if not isinstance(value, str) or not ID.fullmatch(value):
        raise ValueError("Invalid dataset or run id")
    return value


def manifest(dataset: str) -> dict:
    return json.loads((MANIFESTS / f"{validate_id(dataset)}.json").read_text())


def local_path(file: dict) -> Path:
    path = (CACHE / file["path"]).resolve()
    if not path.is_relative_to(CACHE.resolve()):
        raise ValueError("Data path escapes cache")
    return path


def verified_path(file: dict) -> Path:
    path = local_path(file)
    if not path.is_file():
        raise ValueError(f"Data file is missing: {file['path']}")
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    if digest.hexdigest() != file["sha256"]:
        raise ValueError(f"Checksum mismatch: {file['path']}")
    return path


def _timestamp_ns(value: str, field: str) -> int:
    if not isinstance(value, str):
        raise ValueError(f"Invalid {field} timestamp")
    fractional = re.search(r"\.(\d+)(?:Z|\+00:00)\Z", value)
    if fractional and len(fractional.group(1)) > 9:
        raise ValueError(f"{field} exceeds nanosecond precision")
    try:
        stamp = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError(f"Invalid {field} timestamp") from error
    if stamp.tzinfo is None or stamp.utcoffset().total_seconds() != 0:
        raise ValueError(f"{field} must be UTC ISO 8601")
    fraction_ns = int(fractional.group(1).ljust(9, "0")) if fractional else 0
    return int(stamp.replace(microsecond=0).timestamp()) * 1_000_000_000 + fraction_ns


def parse_csv(path: Path, symbol: str) -> list[Bar]:
    """Read a pretty_ts/pretty_px, symbol-mapped TBBO export for one raw contract."""
    bars: list[Bar] = []
    previous: int | None = None
    with path.open(newline="", encoding="utf-8-sig") as source:
        reader = csv.DictReader(source)
        if reader.fieldnames is None or not REQUIRED.issubset(reader.fieldnames):
            raise ValueError(f"{path.name}: missing TBBO fields: {sorted(REQUIRED - set(reader.fieldnames or []))}")
        for line, row in enumerate(reader, 2):
            try:
                if None in row or row["symbol"] != symbol or row["action"] != "T":
                    raise ValueError("Expected a trade for the manifest's raw contract symbol")
                event = _timestamp_ns(row["ts_event"], "ts_event")
                _timestamp_ns(row["ts_recv"], "ts_recv")
                if previous is not None and event < previous:
                    raise ValueError("Trade events are out of order")
                previous = event
                if not row["instrument_id"].isdigit():
                    raise ValueError("Invalid instrument_id")
                price = Decimal(row["price"])
                size = int(row["size"])
                if not price.is_finite() or price <= 0 or size <= 0:
                    raise ValueError("Invalid trade price or size")
                minute = event // 60_000_000_000 * 60
                px = float(price)
                if bars and bars[-1].time == minute:
                    old = bars[-1]
                    bars[-1] = Bar(minute, old.open, max(old.high, px), min(old.low, px), px, old.volume + size)
                else:
                    bars.append(Bar(minute, px, px, px, px, size))
            except (ValueError, InvalidOperation, TypeError) as error:
                raise ValueError(f"{path.name}:{line}: {error}") from error
    return bars


def load(dataset: str) -> tuple[dict, list[Bar]]:
    m = manifest(dataset)
    if m.get("provider") != "databento" or m.get("schema") != "tbbo" or m.get("encoding") != "csv":
        raise ValueError("Expected a Databento TBBO CSV manifest")
    if m.get("price_format") != "decimal" or m.get("timestamp_format") != "iso8601_utc":
        raise ValueError("Export CSV with decimal prices and UTC ISO 8601 timestamps")
    if m.get("asset") == "future" and not m.get("contract"):
        raise ValueError("Futures require an explicit raw contract symbol")
    if not m.get("files"):
        raise ValueError("Manifest has no data files")
    bars: list[Bar] = []
    for file in m["files"]:
        chunk = parse_csv(verified_path(file), m["symbol"])
        if bars and chunk and chunk[0].time <= bars[-1].time:
            raise ValueError("Data files overlap or are out of order")
        bars.extend(chunk)
    if not bars:
        raise ValueError("No trade events in dataset")
    return m, bars


def quality(m: dict, bars: list[Bar]) -> dict:
    gaps = [(a, b) for a, b in zip(bars, bars[1:]) if b.time - a.time > 60]
    return {"dataset": m["id"], "bars": len(bars), "start": datetime.fromtimestamp(bars[0].time, timezone.utc).isoformat(),
            "end": datetime.fromtimestamp(bars[-1].time + 60, timezone.utc).isoformat(), "volume": sum(b.volume for b in bars),
            "min_price": min(b.low for b in bars), "max_price": max(b.high for b in bars),
            "zero_volume_bars": sum(b.volume == 0 for b in bars), "gap_count": len(gaps),
            "unobserved_minutes": sum((b.time - a.time) // 60 - 1 for a, b in gaps),
            "largest_gap_minutes": max(((b.time - a.time) // 60 - 1 for a, b in gaps), default=0),
            "note": "Gaps may be closures or absent trades. No bars are fabricated or session calendar applied."}


def analyze(dataset: str) -> dict:
    return quality(*load(dataset))


def catalog() -> list[dict]:
    result = []
    for path in sorted(MANIFESTS.glob("*.json")):
        m = json.loads(path.read_text())
        result.append({**m, "downloaded": all(local_path(f).is_file() for f in m["files"])})
    return result


def instrument(m: dict) -> Instrument:
    return Instrument(m["symbol"], m["asset"], m["multiplier"], m["tick_size"])
