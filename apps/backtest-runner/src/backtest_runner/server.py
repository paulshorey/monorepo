"""Loopback-only local development API. Not an authenticated deployment server."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import logging
from urllib.parse import urlparse
from .data import analyze, catalog
from .service import execute, list_runs, read_run


class Handler(BaseHTTPRequestHandler):
    def reply(self, status, body):
        data = json.dumps(body, allow_nan=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def route(self):
        path = urlparse(self.path).path
        if self.command == "GET":
            if path == "/api/health":
                return {"status": "ok", "mode": "research-only"}
            if path == "/api/datasets":
                return catalog()
            if path == "/api/runs":
                return list_runs()
            if path.startswith("/api/runs/"):
                return read_run(path.removeprefix("/api/runs/"))
            if path.startswith("/api/quality/"):
                return analyze(path.removeprefix("/api/quality/"))
        elif path == "/api/runs":
            if self.headers.get_content_type() != "application/json":
                raise ValueError("Expected application/json")
            origin = self.headers.get("Origin")
            if origin and origin not in ("http://localhost:4400", "http://127.0.0.1:4400"):
                raise ValueError("Untrusted browser origin")
            size = int(self.headers.get("Content-Length", 0))
            if not 0 < size <= 16384:
                raise ValueError("Request must be between 1 and 16384 bytes")
            body = json.loads(self.rfile.read(size))
            if not isinstance(body, dict) or set(body) - {"dataset", "config"}:
                raise ValueError("Expected dataset and config")
            return execute(body["dataset"], body.get("config", {}))
        raise FileNotFoundError("Unknown route")

    def dispatch(self):
        try:
            self.reply(200, self.route())
        except FileNotFoundError:
            self.reply(404, {"error": "Resource not found"})
        except (ValueError, TypeError, KeyError) as error:
            self.reply(400, {"error": str(error)})
        except Exception:
            logging.exception("Research API failed")
            self.reply(500, {"error": "Research run failed; check the server log"})

    do_GET = do_POST = dispatch


def serve(port: int):
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Research API: http://127.0.0.1:{port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
