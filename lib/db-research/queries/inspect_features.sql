-- Parameters: $1 feature_set_id, $2 instrument_id, $3 decision_ns, $4 decision_seq.
-- Ordered, typed values for an inspector/exporter, with explicit carry-forward age.
-- Pick the latest available observation BEFORE checking validity: a new missing
-- observation must not silently fall back to an older valid one.
-- The writer must enforce the causal input-cursor rules described in README.md.
SELECT c.position, c.name, s.unit, s.value_type,
       v.asof_ns, v.asof_seq, v.available_ns,
       CASE WHEN v.asof_ns IS NULL THEN 'missing'
            WHEN $3 - v.asof_ns > c.max_age_ns THEN 'stale'
            ELSE v.status END AS status,
       CASE WHEN $3 - v.asof_ns <= c.max_age_ns THEN v.value_float END AS value_float,
       CASE WHEN $3 - v.asof_ns <= c.max_age_ns THEN v.value_bool END AS value_bool,
       CASE WHEN $3 - v.asof_ns <= c.max_age_ns THEN v.value_category END AS value_category,
       CASE WHEN v.asof_ns IS NULL THEN 'No available observation'
            WHEN $3 - v.asof_ns > c.max_age_ns THEN 'Exceeds feature max_age_ns'
            ELSE v.reason END AS reason
FROM ml.feature_column c
JOIN research.metric_series s ON s.id = c.series_id
LEFT JOIN LATERAL (
    SELECT m.* FROM research.metric_value m
    WHERE m.series_id = c.series_id AND m.instrument_id = $2
      AND m.asof_ns <= $3
      AND (m.asof_ns, m.asof_seq) <= ($3, $4)
      AND m.available_ns <= $3
    ORDER BY m.asof_ns DESC, m.asof_seq DESC
    LIMIT 1
) v ON true
WHERE c.feature_set_id = $1
ORDER BY c.position;
