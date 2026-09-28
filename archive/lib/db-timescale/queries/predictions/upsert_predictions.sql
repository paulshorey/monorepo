-- name: upsert_predictions
-- Canonical UPSERT contract for `predictions`.
-- `label` is intentionally nullable: it is filled in retrospectively once the
-- forward-return window for that prediction closes.
INSERT INTO public.predictions (
  "time", model_id, ticker, prediction, label
)
VALUES
  -- ($1, $2, $3, $4, $5), ...
ON CONFLICT (model_id, ticker, "time") DO UPDATE SET
  prediction = EXCLUDED.prediction,
  label      = COALESCE(EXCLUDED.label, public.predictions.label);
