-- name: upsert_features_v1
-- Canonical UPSERT contract for `features_v1`.
-- Long-format keyed by (ticker, timeframe, feature, time).
-- Re-running a build for the same range overwrites prior values; the writer is
-- responsible for never inserting future-looking values for past rows.
INSERT INTO public.features_v1 (
  "time", ticker, timeframe, feature, value
)
VALUES
  -- ($1, $2, $3, $4, $5), ...
ON CONFLICT (ticker, timeframe, feature, "time") DO UPDATE SET
  value = EXCLUDED.value;
