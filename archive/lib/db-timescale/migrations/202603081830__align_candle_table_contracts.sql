UPDATE public.candles_1m_1s
SET
    trades = COALESCE(trades, 0),
    max_trade_size = COALESCE(max_trade_size, 0),
    big_trades = COALESCE(big_trades, 0),
    big_volume = COALESCE(big_volume, 0),
    sum_bid_depth = COALESCE(sum_bid_depth, 0),
    sum_ask_depth = COALESCE(sum_ask_depth, 0),
    sum_price_volume = COALESCE(sum_price_volume, 0),
    unknown_volume = COALESCE(unknown_volume, 0)
WHERE
    trades IS NULL
    OR max_trade_size IS NULL
    OR big_trades IS NULL
    OR big_volume IS NULL
    OR sum_bid_depth IS NULL
    OR sum_ask_depth IS NULL
    OR sum_price_volume IS NULL
    OR unknown_volume IS NULL;

ALTER TABLE public.candles_1m_1s
    DROP COLUMN IF EXISTS vwap,
    ALTER COLUMN trades SET DEFAULT 0,
    ALTER COLUMN trades SET NOT NULL,
    ALTER COLUMN max_trade_size SET DEFAULT 0,
    ALTER COLUMN max_trade_size SET NOT NULL,
    ALTER COLUMN big_trades SET DEFAULT 0,
    ALTER COLUMN big_trades SET NOT NULL,
    ALTER COLUMN big_volume SET DEFAULT 0,
    ALTER COLUMN big_volume SET NOT NULL,
    ALTER COLUMN sum_bid_depth SET DEFAULT 0,
    ALTER COLUMN sum_bid_depth SET NOT NULL,
    ALTER COLUMN sum_ask_depth SET DEFAULT 0,
    ALTER COLUMN sum_ask_depth SET NOT NULL,
    ALTER COLUMN sum_price_volume SET DEFAULT 0,
    ALTER COLUMN sum_price_volume SET NOT NULL,
    ALTER COLUMN unknown_volume SET DEFAULT 0,
    ALTER COLUMN unknown_volume SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candles_1m_1s_time_desc
    ON public.candles_1m_1s USING btree ("time" DESC);

UPDATE public.candles_1h_1m
SET
    trades = COALESCE(trades, 0),
    max_trade_size = COALESCE(max_trade_size, 0),
    big_trades = COALESCE(big_trades, 0),
    big_volume = COALESCE(big_volume, 0),
    sum_bid_depth = COALESCE(sum_bid_depth, 0),
    sum_ask_depth = COALESCE(sum_ask_depth, 0),
    sum_price_volume = COALESCE(sum_price_volume, 0),
    unknown_volume = COALESCE(unknown_volume, 0)
WHERE
    trades IS NULL
    OR max_trade_size IS NULL
    OR big_trades IS NULL
    OR big_volume IS NULL
    OR sum_bid_depth IS NULL
    OR sum_ask_depth IS NULL
    OR sum_price_volume IS NULL
    OR unknown_volume IS NULL;

ALTER TABLE public.candles_1h_1m
    ALTER COLUMN trades SET DEFAULT 0,
    ALTER COLUMN trades SET NOT NULL,
    ALTER COLUMN max_trade_size SET DEFAULT 0,
    ALTER COLUMN max_trade_size SET NOT NULL,
    ALTER COLUMN big_trades SET DEFAULT 0,
    ALTER COLUMN big_trades SET NOT NULL,
    ALTER COLUMN big_volume SET DEFAULT 0,
    ALTER COLUMN big_volume SET NOT NULL,
    ALTER COLUMN sum_bid_depth SET DEFAULT 0,
    ALTER COLUMN sum_bid_depth SET NOT NULL,
    ALTER COLUMN sum_ask_depth SET DEFAULT 0,
    ALTER COLUMN sum_ask_depth SET NOT NULL,
    ALTER COLUMN sum_price_volume SET DEFAULT 0,
    ALTER COLUMN sum_price_volume SET NOT NULL,
    ALTER COLUMN unknown_volume SET DEFAULT 0,
    ALTER COLUMN unknown_volume SET NOT NULL;
