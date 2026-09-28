CREATE TABLE IF NOT EXISTS public.candles_1h_1m (
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
    trades integer DEFAULT 0,
    max_trade_size double precision DEFAULT 0,
    big_trades integer DEFAULT 0,
    big_volume double precision DEFAULT 0,
    sum_bid_depth double precision DEFAULT 0,
    sum_ask_depth double precision DEFAULT 0,
    sum_price_volume double precision DEFAULT 0,
    unknown_volume double precision DEFAULT 0,
    CONSTRAINT candles_1h_1m_pkey PRIMARY KEY (ticker, "time")
);

CREATE INDEX IF NOT EXISTS idx_candles_1h_1m_time_desc
    ON public.candles_1h_1m USING btree ("time" DESC);

SELECT create_hypertable(
    'public.candles_1h_1m',
    by_range('time', INTERVAL '1 month'),
    if_not_exists => TRUE,
    create_default_indexes => FALSE
);

ALTER TABLE public.candles_1h_1m SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'ticker',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy(
    'public.candles_1h_1m',
    compress_after => INTERVAL '1 month',
    if_not_exists => TRUE
);
