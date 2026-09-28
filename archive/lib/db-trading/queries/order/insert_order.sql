-- name: insert_order
INSERT INTO order_v1 (
  client_id,
  type,
  ticker,
  side,
  amount,
  price,
  server_name,
  app_name,
  node_env
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;
