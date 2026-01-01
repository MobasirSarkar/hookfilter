-- name: CreateEvent :exec
INSERT INTO events (
    id, pipe_id, status_code, request_payload, transformed_payload
) VALUES (
    $1, $2, $3, $4, $5
);


-- name: ListEvents :many
SELECT * FROM events
WHERE pipe_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
