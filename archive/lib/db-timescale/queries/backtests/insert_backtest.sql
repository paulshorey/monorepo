-- name: insert_backtest
-- Record one backtest run. Unlike `models`, this is append-only: every run is
-- a new row so historical backtest artifacts are preserved.
INSERT INTO public.backtests (
  model_id, strategy, ticker, range_start, range_end, params, metrics
)
VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
RETURNING id;
