-- name: select_recent_candles
-- Replace {{TABLE_NAME}} with target table (for example candles_1m_1s or candles_1h_1m).
SELECT
  time,
  ticker,
  symbol,
  open,
  high,
  low,
  close,
  volume,
  ask_volume,
  bid_volume,
  cvd_open,
  cvd_high,
  cvd_low,
  cvd_close,
  vd,
  vd_ratio,
  book_imbalance,
  price_pct,
  divergence,
  trades,
  max_trade_size,
  big_trades,
  big_volume,
  sum_bid_depth,
  sum_ask_depth,
  sum_price_volume,
  unknown_volume
FROM {{TABLE_NAME}}
WHERE ticker = $1
ORDER BY time DESC
LIMIT $2;
