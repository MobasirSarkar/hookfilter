-- name: CreatePipe :exec
INSERT INTO pipes (
   id, user_id, name, slug, target_url, jq_filter
) VALUES (
    $1, $2, $3, $4, $5, $6
);


-- name: GetPipeBySlug :one
SELECT * FROM pipes
WHERE slug = $1
  AND is_active = true
  AND deleted_at IS NULL
LIMIT 1;


-- name: GetPipeById :one
SELECT * FROM pipes
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL LIMIT 1;


-- name: ListPipes :many
SELECT * FROM pipes
WHERE user_id = $1 AND deleted_at IS NULL
LIMIT $2 OFFSET $3;

-- name: UpdatePipe :one
UPDATE pipes
SET target_url = $3,
    jq_filter = $4,
    is_active = $5,
    updated_at = NOW()
WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
RETURNING *;

-- name: DeletePipe :execrows
UPDATE pipes
SET deleted_at = NOW(), is_active = false
WHERE id = $1 
  AND user_id = $2
  AND deleted_at IS NULL;
