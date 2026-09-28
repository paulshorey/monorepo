-- name: insert_model
-- Register a model run. (name, version) is unique; re-registering the same
-- pair returns the existing id so callers can be idempotent.
INSERT INTO public.models (name, version, params, metrics, artifact_uri)
VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
ON CONFLICT (name, version) DO UPDATE SET
  params       = EXCLUDED.params,
  metrics      = EXCLUDED.metrics,
  artifact_uri = EXCLUDED.artifact_uri
RETURNING id;
