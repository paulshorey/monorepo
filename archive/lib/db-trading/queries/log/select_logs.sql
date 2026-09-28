-- name: select_logs
-- Filters are optional and should be appended by adapters.
SELECT *
FROM log_v1
ORDER BY created_at DESC
LIMIT $1;
