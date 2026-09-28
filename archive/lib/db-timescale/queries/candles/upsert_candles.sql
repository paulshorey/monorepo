-- name: upsert_candles_batch
-- Canonical upsert contract for candle rows.
-- Replace {{TABLE_NAME}} with target table (for example candles_1m_1s or candles_1h_1m).
-- Expand VALUES tuples as needed for batched inserts.
INSERT INTO {{TABLE_NAME}} (
  time, ticker, symbol,
  open, high, low, close, volume,
  ask_volume, bid_volume,
  cvd_open, cvd_high, cvd_low, cvd_close,
  vd, vd_ratio, book_imbalance, price_pct, divergence,
  trades, max_trade_size, big_trades, big_volume,
  sum_bid_depth, sum_ask_depth, sum_price_volume, unknown_volume
)
VALUES
  -- ($1, $2, ... $27), ($28, ...), ...
ON CONFLICT (ticker, time) DO UPDATE SET
  symbol = EXCLUDED.symbol,
  open = EXCLUDED.open,
  high = EXCLUDED.high,
  low = EXCLUDED.low,
  close = EXCLUDED.close,
  volume = EXCLUDED.volume,
  ask_volume = EXCLUDED.ask_volume,
  bid_volume = EXCLUDED.bid_volume,
  cvd_open = EXCLUDED.cvd_open,
  cvd_high = EXCLUDED.cvd_high,
  cvd_low = EXCLUDED.cvd_low,
  cvd_close = EXCLUDED.cvd_close,
  vd = EXCLUDED.vd,
  vd_ratio = EXCLUDED.vd_ratio,
  book_imbalance = EXCLUDED.book_imbalance,
  price_pct = EXCLUDED.price_pct,
  divergence = EXCLUDED.divergence,
  trades = EXCLUDED.trades,
  max_trade_size = EXCLUDED.max_trade_size,
  big_trades = EXCLUDED.big_trades,
  big_volume = EXCLUDED.big_volume,
  sum_bid_depth = EXCLUDED.sum_bid_depth,
  sum_ask_depth = EXCLUDED.sum_ask_depth,
  sum_price_volume = EXCLUDED.sum_price_volume,
  unknown_volume = EXCLUDED.unknown_volume;
