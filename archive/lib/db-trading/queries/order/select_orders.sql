-- name: select_orders
-- Filters are optional and should be appended by adapters.
SELECT *
FROM order_v1
ORDER BY created_at DESC
LIMIT $1;
