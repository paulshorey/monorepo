import argparse
import json
from .data import analyze, catalog
from .service import execute
from .server import serve


def main():
    parser = argparse.ArgumentParser(description="Local Databento research runner")
    sub = parser.add_subparsers(dest="command", required=True)
    for command in ("analyze", "run"):
        p = sub.add_parser(command)
        p.add_argument("--dataset", required=True)
        if command == "run":
            p.add_argument("--config", help="Path to a JSON Config object")
    sub.add_parser("catalog")
    p = sub.add_parser("serve")
    p.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    try:
        if args.command == "serve":
            serve(args.port)
            return
        if args.command == "catalog":
            result = catalog()
        elif args.command == "analyze":
            result = analyze(args.dataset)
        else:
            from pathlib import Path
            result = execute(args.dataset, json.loads(Path(args.config).read_text()) if args.config else {})
            result = {"id": result["id"], "metrics": result["metrics"], "quality": result["quality"]}
        print(json.dumps(result, indent=2, allow_nan=False))
    except (ValueError, TypeError, KeyError, OSError) as error:
        parser.exit(1, f"Error: {error}\n")
