-- name: CreateUser :exec
INSERT INTO users (
    username, password, email, avatar_url
) VALUES (
    $1, $2, $3, $4
);

-- name: CreateUserReturning :one
INSERT INTO users (
    username, password, email, avatar_url
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 AND deleted_at IS NULL LIMIT 1;

-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1 AND deleted_at IS NULL LIMIT 1;


-- name: GetUserByOAuth :one
SELECT * FROM users
WHERE oauth_provider = $1 AND oauth_provider_id = $2 AND deleted_at IS NULL LIMIT 1;


-- name: LoginOAuthUser :one
INSERT INTO users (
    id,
    email,
    username,
    oauth_provider,
    oauth_provider_id,
    avatar_url
) VALUES (
    gen_random_uuid(),
    $1, $2, $3, $4, $5
)
ON CONFLICT (email)
DO UPDATE SET
    oauth_provider = COALESCE(users.oauth_provider, EXCLUDED.oauth_provider),
    oauth_provider_id = COALESCE(users.oauth_provider_id, EXCLUDED.oauth_provider_id),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW()
WHERE users.deleted_at IS NULL
RETURNING *;



-- name: IncrementUserTokenVersion :exec
UPDATE users
SET token_version = token_version + 1
WHERE id = $1;
