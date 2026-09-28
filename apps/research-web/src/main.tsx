import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ResearchChart } from "@lib/research-charts";
import type { Config, Dataset, Run, RunSummary } from "@/types";
import "@/style.css";

const initial: Config = {
  strategy: "sma_cross",
  fast: 10,
  slow: 30,
  initial_cash: 100000,
  quantity: 0.1,
  fee_bps: 5,
  fee_per_unit: 0,
  slippage_bps: 1,
  max_drawdown_pct: 10,
  allow_short: false,
};
const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
const timestamp = (value: number) =>
  new Date(value * 1000).toISOString().slice(0, 16).replace("T", " ");
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${path}`, options);
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}
function App() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [dataset, setDataset] = useState("");
  const [config, setConfig] = useState<Config>(initial);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(false);
  useEffect(() => {
    Promise.all([api<Dataset[]>("datasets"), api<RunSummary[]>("runs")])
      .then(([data, history]) => {
        setDatasets(data);
        if (data.length) setDataset(data[0].id);
        setRuns(history);
        setOnline(true);
      })
      .catch(() =>
        setError(
          "Cannot reach the research API. Start both apps with pnpm dev, then reload.",
        ),
      );
  }, []);
  const selected = datasets.find((d) => d.id === dataset);
  function selectDataset(id: string) {
    const future = datasets.find((d) => d.id === id)?.asset === "future";
    setDataset(id);
    setConfig((c) => ({
      ...c,
      quantity: future ? 1 : 0.1,
      fee_bps: future ? 0 : 5,
      fee_per_unit: future ? 2.5 : 0,
      allow_short: future,
    }));
  }
  async function execute(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<Run>("runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset, config }),
      });
      setRun(result);
      setRuns(await api<RunSummary[]>("runs"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  async function openRun(id: string) {
    setBusy(true);
    setError("");
    try {
      const result = await api<Run>(`runs/${id}`);
      setRun(result);
      setDataset(result.quality.dataset);
      setConfig(result.config);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const numeric = (
    name: keyof Config,
    label: string,
    min: number,
    step: number,
    max?: number,
  ) => (
    <label>
      {label}
      <input
        type="number"
        required
        min={min}
        max={max}
        step={step}
        value={String(config[name])}
        onChange={(e) =>
          setConfig({
            ...config,
            [name]: e.target.value === "" ? "" : Number(e.target.value),
          })
        }
      />
    </label>
  );
  return (
    <div className="shell">
      <header>
        <a className="brand" href="/">
          ◫{" "}
          <span>
            TRADING<span className="brand-light"> / RESEARCH</span>
          </span>
        </a>
        <span className="status">
          <i className={online ? "online" : ""} />{" "}
          {online ? "Local research API" : "Connecting"}{" "}
          <span className="divider">/</span> Simulation only
        </span>
      </header>
      <div className="intro">
        <div>
          <p className="eyebrow">WORKSPACE 01 / STRATEGY DEVELOPMENT</p>
          <h1>
            Strategy lab<span>.</span>
          </h1>
          <p className="muted">
            Explore a hypothesis. Replay the market. Inspect every decision.
          </p>
        </div>
        <span className="tag">DATABENTO TBBO · PYTHON REPLAY</span>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <main>
        <aside>
          <form onSubmit={execute}>
            <fieldset disabled={busy || datasets.length === 0}>
              <div className="panel-title">
                <h2>Experiment setup</h2>
                <span>01</span>
              </div>
              <label>
                Historical dataset
                <select
                  value={dataset}
                  onChange={(e) => selectDataset(e.target.value)}
                >
                  {datasets.length === 0 && <option value="">No datasets registered</option>}
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="hint">
                {selected
                  ? `${selected.provider} ${selected.schema.toUpperCase()} · trade-derived minute bars`
                  : "Add a local TBBO manifest and export to begin."}
              </p>
              {selected && !selected.downloaded && (
                <p className="error">
                  Export file missing. See docs/project/data.md.
                </p>
              )}
              <label>
                Strategy
                <select
                  value={config.strategy}
                  onChange={(e) =>
                    setConfig({ ...config, strategy: e.target.value })
                  }
                >
                  <option value="sma_cross">Moving average crossover</option>
                  <option value="rsi_reversion">RSI mean reversion</option>
                </select>
              </label>
              <div className="pair">
                {numeric(
                  "fast",
                  config.strategy === "sma_cross"
                    ? "Fast window"
                    : "RSI period",
                  1,
                  1,
                  9999,
                )}
                {numeric("slow", "Warmup / slow", 2, 1, 10000)}
              </div>
              <p className="hint">
                {config.strategy === "sma_cross"
                  ? "Targets follow the fast / slow average spread."
                  : "Enter below RSI 30, exit at 50. Shorts reverse the thresholds."}{" "}
                Windows count observed bars.
              </p>
              <div className="rule" />
              <h3>Position & execution</h3>
              <div className="pair">
                {numeric("initial_cash", "Starting equity ($)", 1, 1)}
                {numeric(
                  "quantity",
                  selected?.asset === "future" ? "Contracts" : "Quantity (BTC)",
                  selected?.asset === "future" ? 1 : 0.0001,
                  selected?.asset === "future" ? 1 : 0.0001,
                )}
              </div>
              <div className="pair">
                {numeric("fee_bps", "Fee (bps)", 0, 0.1, 1000)}
                {numeric("fee_per_unit", "Fee / unit ($)", 0, 0.01)}
              </div>
              <div className="pair">
                {numeric("slippage_bps", "Slippage (bps)", 0, 0.1, 1000)}
                {numeric(
                  "max_drawdown_pct",
                  "Halt at drawdown %",
                  0.1,
                  0.1,
                  100,
                )}
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={config.allow_short}
                  disabled={selected?.asset !== "future"}
                  onChange={(e) =>
                    setConfig({ ...config, allow_short: e.target.checked })
                  }
                />{" "}
                Allow short futures positions
              </label>
              <button
                className="primary"
                disabled={!selected?.downloaded || busy}
              >
                {busy ? "Running experiment…" : "Run backtest"} <span>↗</span>
              </button>
              <p className="hint">
                Next observed bar fills · full collateral
                <br />
                Results are saved locally and reproducible.
              </p>
            </fieldset>
          </form>
        </aside>
        <section className="results">
          <div className="metrics">
            {[
              ["Net P&L", run ? money(run.metrics.net_pnl) : "—"],
              ["Return", run ? `${run.metrics.return_pct.toFixed(3)}%` : "—"],
              [
                "Max drawdown",
                run ? `${run.metrics.max_drawdown_pct.toFixed(3)}%` : "—",
              ],
              [
                "Fills / fees",
                run
                  ? `${run.metrics.fill_count} / ${money(run.metrics.fees)}`
                  : "—",
              ],
            ].map(([label, value]) => (
              <div className="metric" key={label}>
                <p>{label}</p>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="chart-panel">
            <div className="panel-title">
              <div>
                <h2>
                  {run
                    ? datasets.find((d) => d.id === run.quality.dataset)
                        ?.label || run.quality.dataset
                    : "Market replay"}
                </h2>
                <p className="hint">
                  {run
                    ? `${run.config.strategy} · ${run.config.fast}/${run.config.slow} · ${run.quality.bars.toLocaleString()} observed bars · UTC`
                    : "Price, execution markers, and portfolio equity"}
                </p>
              </div>
              <span className="legend">
                ● PRICE <b>● EQUITY</b>
              </span>
            </div>
            {run ? (
              <ResearchChart
                bars={run.bars}
                fills={run.fills}
                equity={run.equity}
                haltTime={
                  run.decisions.find((d) => d.reason === "drawdown_halt")?.time
                }
              />
            ) : (
              <div className="empty">
                <div className="empty-graphic">▁ ▃ ▂ ▅ ▄ ▆ ▃ ▇</div>
                <h2>Your next experiment starts here.</h2>
                <p>
                  Choose a dataset and strategy, then run a backtest.
                  <br />
                  Every fill and cost will appear in the replay.
                </p>
              </div>
            )}
          </div>
          {run && (
            <div className="data-note">
              <span>DATA QUALITY</span> {run.quality.gap_count} gaps ·{" "}
              {run.quality.unobserved_minutes} unobserved minutes · no synthetic
              bars. Open position: {run.metrics.open_position}.{" "}
              {run.metrics.halted ? "Risk halt triggered." : ""}{" "}
              <a href={`/api/runs/${run.id}`} download={`${run.id}.json`}>
                Export run JSON ↗
              </a>
            </div>
          )}
          <div className="bottom-grid">
            <section className="panel">
              <div className="panel-title">
                <h2>Experiment history</h2>
                <span>{runs.length.toString().padStart(2, "0")}</span>
              </div>
              {runs.length ? (
                <div className="history">
                  {runs.slice(0, 12).map((r) => (
                    <button
                      disabled={busy}
                      className={
                        run?.id === r.id
                          ? "history-item active"
                          : "history-item"
                      }
                      key={r.id}
                      onClick={() => openRun(r.id)}
                    >
                      <span>
                        {r.dataset}
                        <small>
                          {r.config.strategy} · {r.config.fast}/{r.config.slow}{" "}
                          · {r.id.slice(0, 8)}
                        </small>
                      </span>
                      <b>{money(r.metrics.net_pnl)}</b>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="hint padding">
                  Completed experiments will appear here.
                </p>
              )}
            </section>
            <section className="panel">
              <div className="panel-title">
                <h2>Execution ledger</h2>
                <span>{run?.fills.length || "00"}</span>
              </div>
              <div className="ledger">
                {run?.fills.length ? (
                  <table>
                    <thead>
                      <tr>
                        <th>UTC / fill</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {run.fills
                        .slice(-50)
                        .reverse()
                        .map((f, n) => (
                          <tr key={n}>
                            <td>{timestamp(f.time)}</td>
                            <td className={f.quantity > 0 ? "buy" : "sell"}>
                              {f.quantity > 0 ? "+" : ""}
                              {f.quantity}
                            </td>
                            <td>{f.price.toFixed(2)}</td>
                            <td>{f.fee.toFixed(2)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="hint padding">No simulated fills yet.</p>
                )}
              </div>
            </section>
          </div>
          {run && (
            <details>
              <summary>Execution assumptions & provenance · {run.id}</summary>
              <ul>
                {run.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p>Code SHA-256: {run.provenance.code_sha256}</p>
              <p>
                Latest 50 fills shown; export includes the complete ledger,
                inputs, checksums, and decisions.
              </p>
            </details>
          )}
        </section>
      </main>
      <footer>
        <span>RESEARCH FIRST. LIVE EXECUTION IS NOT CONNECTED.</span>
        <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">
          Charts by TradingView
        </a>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
