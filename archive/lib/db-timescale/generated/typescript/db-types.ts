// AUTO-GENERATED FILE. DO NOT EDIT.
// Run: pnpm --filter @lib/db-timescale db:types:generate

export interface BacktestsRow {
  "id": number;
  "model_id": number | null;
  "strategy": string;
  "ticker": string;
  "range_start": Date;
  "range_end": Date;
  "params": unknown;
  "metrics": unknown;
  "created_at": Date;
}

export interface Candles1d1hRow {
  "time": Date;
  "ticker": string;
  "symbol": string | null;
  "open": number;
  "high": number;
  "low": number;
  "close": number;
  "volume": number;
  "ask_volume": number;
  "bid_volume": number;
  "cvd_open": number | null;
  "cvd_high": number | null;
  "cvd_low": number | null;
  "cvd_close": number | null;
  "vd": number | null;
  "vd_ratio": number | null;
  "book_imbalance": number | null;
  "price_pct": number | null;
  "divergence": number | null;
  "trades": number;
  "max_trade_size": number;
  "big_trades": number;
  "big_volume": number;
  "sum_bid_depth": number;
  "sum_ask_depth": number;
  "sum_price_volume": number;
  "unknown_volume": number;
}

export interface Candles1h1mRow {
  "time": Date;
  "ticker": string;
  "symbol": string | null;
  "open": number;
  "high": number;
  "low": number;
  "close": number;
  "volume": number;
  "ask_volume": number;
  "bid_volume": number;
  "cvd_open": number | null;
  "cvd_high": number | null;
  "cvd_low": number | null;
  "cvd_close": number | null;
  "vd": number | null;
  "vd_ratio": number | null;
  "book_imbalance": number | null;
  "price_pct": number | null;
  "divergence": number | null;
  "trades": number;
  "max_trade_size": number;
  "big_trades": number;
  "big_volume": number;
  "sum_bid_depth": number;
  "sum_ask_depth": number;
  "sum_price_volume": number;
  "unknown_volume": number;
}

export interface Candles1m1sRow {
  "time": Date;
  "ticker": string;
  "open": number;
  "high": number;
  "low": number;
  "close": number;
  "volume": number | null;
  "ask_volume": number | null;
  "bid_volume": number | null;
  "cvd_open": number | null;
  "cvd_high": number | null;
  "cvd_low": number | null;
  "cvd_close": number | null;
  "vd": number | null;
  "trades": number;
  "max_trade_size": number;
  "big_trades": number;
  "big_volume": number;
  "symbol": string | null;
  "vd_ratio": number | null;
  "book_imbalance": number | null;
  "price_pct": number | null;
  "divergence": number | null;
  "sum_bid_depth": number;
  "sum_ask_depth": number;
  "sum_price_volume": number;
  "unknown_volume": number;
}

export interface FeaturesV1Row {
  "time": Date;
  "ticker": string;
  "timeframe": string;
  "feature": string;
  "value": number | null;
}

export interface ModelsRow {
  "id": number;
  "name": string;
  "version": string;
  "params": unknown;
  "metrics": unknown;
  "artifact_uri": string | null;
  "created_at": Date;
}

export interface PredictionsRow {
  "time": Date;
  "model_id": number;
  "ticker": string;
  "prediction": number;
  "label": number | null;
}

export interface TimescaleDbSchema {
  "backtests": BacktestsRow;
  "candles_1d_1h": Candles1d1hRow;
  "candles_1h_1m": Candles1h1mRow;
  "candles_1m_1s": Candles1m1sRow;
  "features_v1": FeaturesV1Row;
  "models": ModelsRow;
  "predictions": PredictionsRow;
}
