-- name: select_features_v1
-- Read one (ticker, timeframe, feature) series in time order.
-- Optional bounds via $4 (start, inclusive) and $5 (end, exclusive); pass NULL
-- to omit either bound.
SELECT
  "time",
  value
FROM public.features_v1
WHERE ticker = $1
  AND timeframe = $2
  AND feature = $3
  AND ($4::timestamptz IS NULL OR "time" >= $4)
  AND ($5::timestamptz IS NULL OR "time" <  $5)
ORDER BY "time" ASC;
