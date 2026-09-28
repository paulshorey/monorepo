-- ============================================================================
-- Derived canonical table setup for write-node
--
-- Current scope:
--   - 1-hour rolling candles
--   - written every minute
--   - stored in candles_1h_1m
--   - derived from minute-boundary rows in candles_1m_1s
-- ============================================================================

DROP TABLE IF EXISTS candles_1h_1m CASCADE;

CREATE TABLE candles_1h_1m (
  time             TIMESTAMPTZ      NOT NULL,
  ticker           TEXT             NOT NULL,
  symbol           TEXT,
  open             DOUBLE PRECISION NOT NULL,
  high             DOUBLE PRECISION NOT NULL,
  low              DOUBLE PRECISION NOT NULL,
  close            DOUBLE PRECISION NOT NULL,
  volume           DOUBLE PRECISION NOT NULL DEFAULT 0,
  ask_volume       DOUBLE PRECISION NOT NULL DEFAULT 0,
  bid_volume       DOUBLE PRECISION NOT NULL DEFAULT 0,
  cvd_open         DOUBLE PRECISION,
  cvd_high         DOUBLE PRECISION,
  cvd_low          DOUBLE PRECISION,
  cvd_close        DOUBLE PRECISION,
  vd               DOUBLE PRECISION,
  vd_ratio         DOUBLE PRECISION,
  book_imbalance   DOUBLE PRECISION,
  price_pct        DOUBLE PRECISION,
  divergence       DOUBLE PRECISION,
  trades           INTEGER          NOT NULL DEFAULT 0,
  max_trade_size   DOUBLE PRECISION NOT NULL DEFAULT 0,
  big_trades       INTEGER          NOT NULL DEFAULT 0,
  big_volume       DOUBLE PRECISION NOT NULL DEFAULT 0,
  sum_bid_depth    DOUBLE PRECISION NOT NULL DEFAULT 0,
  sum_ask_depth    DOUBLE PRECISION NOT NULL DEFAULT 0,
  sum_price_volume DOUBLE PRECISION NOT NULL DEFAULT 0,
  unknown_volume   DOUBLE PRECISION NOT NULL DEFAULT 0,
  PRIMARY KEY (ticker, time)
);

SELECT create_hypertable(
  'candles_1h_1m',
  by_range('time', INTERVAL '1 month')
);

CREATE INDEX idx_candles_1h_1m_time_desc ON candles_1h_1m (time DESC);

ALTER TABLE candles_1h_1m SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'ticker',
  timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('candles_1h_1m', INTERVAL '1 month');
