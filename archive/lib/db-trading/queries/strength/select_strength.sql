-- name: select_strength
-- Filters are optional and should be appended by adapters.
SELECT *
FROM strength_v1
ORDER BY timenow DESC
LIMIT $1;
