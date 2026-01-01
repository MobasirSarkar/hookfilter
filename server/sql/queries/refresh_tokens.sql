-- name: CreateRefreshToken :exec
INSERT INTO refresh_tokens (
    id, user_id, token_hash, expires_at
) VALUES (
    $1, $2, $3, $4
);

-- name: GetRefreshToken :one
SELECT *
FROM refresh_tokens
WHERE token_hash = $1
  AND revoked_at IS NULL
  AND expires_at > NOW()
LIMIT 1;

-- name: RevokeRefreshToken :exec
UPDATE refresh_tokens
SET revoked_at = NOW()
WHERE id = $1;

-- name: RevokeAllRefreshTokensForUser :exec
UPDATE refresh_tokens
SET revoked_at = NOW()
WHERE user_id = $1 AND revoked_at IS NULL;
