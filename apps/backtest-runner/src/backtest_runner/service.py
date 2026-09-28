from dataclasses import asdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import tempfile
from strategy_core import Config, run_backtest
from .data import ROOT, instrument, load, quality, validate_id

RUNS = ROOT / "data/runs"


def code_digest() -> str:
    digest = hashlib.sha256()
    for base in (ROOT / "lib/strategy-core/src", ROOT / "apps/backtest-runner/src"):
        for path in sorted(base.rglob("*.py")):
            digest.update(str(path.relative_to(ROOT)).encode())
            digest.update(path.read_bytes())
    return digest.hexdigest()


LOADED_CODE_SHA256 = code_digest()


def execute(dataset: str, options: dict) -> dict:
    if code_digest() != LOADED_CODE_SHA256:
        raise ValueError("Python source changed; restart the API before creating another run")
    if not isinstance(options, dict):
        raise ValueError("config must be an object")
    config = Config(**options)
    metadata, bars = load(dataset)
    result = run_backtest(bars, config, instrument(metadata))
    identity = {"dataset": metadata, "config": asdict(config), "code_sha256": LOADED_CODE_SHA256, "schema_version": 1}
    result.update({"id": hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()[:24],
                   "schema_version": 1, "created_at": datetime.now(timezone.utc).isoformat(), "provenance": identity,
                   "quality": quality(metadata, bars), "bars": [asdict(b) for b in bars],
                   "assumptions": ["Databento TBBO trades aggregated into observed minute bars; trade-time BBO is not yet used by this simulator.",
                     "Decisions at bar close; market fills at next observed nonzero-volume bar open with adverse tick rounding.",
                     "Full collateral, fixed size, fees and slippage; no margin, funding, borrowing, depth, partial fills, or contract rolls.",
                     "Gaps are preserved; windows count observed bars. No calendar or automatic daily liquidation.",
                     "Final position is marked to market, not liquidated. Drawdown halt exits on next available fill.",
                     "No claim of strategy profitability follows from an integration run."]})
    RUNS.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode="w", dir=RUNS, suffix=".tmp", delete=False) as out:
        json.dump(result, out, allow_nan=False)
        temp = Path(out.name)
    temp.replace(RUNS / f"{result['id']}.json")
    return result


def read_run(run_id: str) -> dict:
    return json.loads((RUNS / f"{validate_id(run_id)}.json").read_text())


def list_runs() -> list[dict]:
    rows = []
    for path in RUNS.glob("*.json"):
        result = json.loads(path.read_text())
        rows.append({"id": result["id"], "created_at": result["created_at"], "dataset": result["quality"]["dataset"], "config": result["config"], "metrics": result["metrics"]})
    return sorted(rows, key=lambda r: r["created_at"], reverse=True)
