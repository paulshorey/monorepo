# Research web

The developer UI for configuring, inspecting, and troubleshooting trading experiments.
The current React/Vite app supports strategy and cost settings, price/equity charts,
fill details, saved-run history, and JSON export. Chart times are UTC.

Next, extend the UI to explore custom metrics and ML outputs, compare experiments,
and monitor and control continuous trading strategies.

Run `pnpm dev` from the repository root to start both apps. Vite proxies `/api` to
the local Python server on port 8001. See the [root README](../../README.md) for setup.
