-- 202605061830__add_candles_1d_1h.sql
-- Adds the canonical daily timeframe table.
--
-- Each row is a trailing 24-hour rolling window for a ticker, derived from the
-- hour-boundary subset of `candles_1h_1m`. The cadence of new rows is one per
-- hour. Schema mirrors `candles_1h_1m` so derived metrics can be recomputed
-- correctly from raw aggregated fields at any timeframe.

CREATE TABLE IF NOT EXISTS public.candles_1d_1h (
    "time" timestamp with time zone NOT NULL,
    ticker text NOT NULL,
    symbol text,
    open double precision NOT NULL,
    high double precision NOT NULL,
    low double precision NOT NULL,
    close double precision NOT NULL,
    volume double precision DEFAULT 0 NOT NULL,
    ask_volume double precision DEFAULT 0 NOT NULL,
    bid_volume double precision DEFAULT 0 NOT NULL,
    cvd_open double precision,
    cvd_high double precision,
    cvd_low double precision,
    cvd_close double precision,
    vd double precision,
    vd_ratio double precision,
    book_imbalance double precision,
    price_pct double precision,
    divergence double precision,
    trades integer DEFAULT 0 NOT NULL,
    max_trade_size double precision DEFAULT 0 NOT NULL,
    big_trades integer DEFAULT 0 NOT NULL,
    big_volume double precision DEFAULT 0 NOT NULL,
    sum_bid_depth double precision DEFAULT 0 NOT NULL,
    sum_ask_depth double precision DEFAULT 0 NOT NULL,
    sum_price_volume double precision DEFAULT 0 NOT NULL,
    unknown_volume double precision DEFAULT 0 NOT NULL,
    CONSTRAINT candles_1d_1h_pkey PRIMARY KEY (ticker, "time")
);

CREATE INDEX IF NOT EXISTS idx_candles_1d_1h_time_desc
    ON public.candles_1d_1h USING btree ("time" DESC);

SELECT create_hypertable(
    'public.candles_1d_1h',
    by_range('time', INTERVAL '6 months'),
    if_not_exists => TRUE,
    create_default_indexes => FALSE
);

ALTER TABLE public.candles_1d_1h SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'ticker',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy(
    'public.candles_1d_1h',
    compress_after => INTERVAL '6 months',
    if_not_exists => TRUE
);
