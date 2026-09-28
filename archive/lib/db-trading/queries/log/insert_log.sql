-- name: insert_log
INSERT INTO log_v1 (
  name,
  message,
  stack,
  access_key,
  server_name,
  app_name,
  node_env,
  category,
  tag
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;
