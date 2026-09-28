SELECT create_hypertable(
    'public.candles_1m_1s',
    by_range('time', INTERVAL '1 week'),
    if_not_exists => TRUE,
    create_default_indexes => FALSE
);

ALTER TABLE public.candles_1m_1s SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'ticker',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy(
    'public.candles_1m_1s',
    compress_after => INTERVAL '1 week',
    if_not_exists => TRUE
);
