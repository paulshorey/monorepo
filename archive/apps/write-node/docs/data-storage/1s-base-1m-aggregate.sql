-- ============================================================================
-- Base table setup for write-node
--
-- Current scope:
--   - 1-minute rolling candles
--   - written every second
--   - stored in candles_1m_1s
--
-- This script intentionally defines only the current source-of-truth table.
-- The next canonical layer, candles_1h_1m, is derived from the minute-boundary
-- subset of this table.
-- ============================================================================

DROP TABLE IF EXISTS candles_1m_1s CASCADE;

CREATE TABLE candles_1m_1s (
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
  'candles_1m_1s',
  by_range('time', INTERVAL '1 week')
);

CREATE INDEX idx_candles_1m_1s_time_desc ON candles_1m_1s (time DESC);

ALTER TABLE candles_1m_1s SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'ticker',
  timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('candles_1m_1s', INTERVAL '1 week');

-- Helpful checks
SELECT show_chunks('candles_1m_1s');
SELECT *
FROM chunk_compression_stats('candles_1m_1s')
ORDER BY chunk_name;
