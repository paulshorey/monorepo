export interface Dataset {
  id: string;
  label: string;
  asset: "crypto" | "future";
  downloaded: boolean;
  provider: string;
  schema: string;
  files: { path: string }[];
}
export interface Config {
  strategy: string;
  fast: number;
  slow: number;
  initial_cash: number;
  quantity: number;
  fee_bps: number;
  fee_per_unit: number;
  slippage_bps: number;
  max_drawdown_pct: number;
  allow_short: boolean;
}
export interface Metrics {
  net_pnl: number;
  return_pct: number;
  max_drawdown_pct: number;
  fees: number;
  fill_count: number;
  open_position: number;
  halted: boolean;
}
export interface RunSummary {
  id: string;
  created_at: string;
  dataset: string;
  config: Config;
  metrics: Metrics;
}
export interface Run extends RunSummary {
  bars: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  fills: {
    time: number;
    decision_time: number;
    quantity: number;
    price: number;
    fee: number;
    position: number;
  }[];
  equity: { time: number; value: number }[];
  decisions: { time: number; reason: string; target: number }[];
  quality: {
    dataset: string;
    bars: number;
    gap_count: number;
    unobserved_minutes: number;
    start: string;
    end: string;
  };
  assumptions: string[];
  provenance: { code_sha256: string };
  pending_target: number | null;
}
