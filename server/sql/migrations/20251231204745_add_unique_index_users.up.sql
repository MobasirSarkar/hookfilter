CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_active
ON users (email)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth_active
ON users (oauth_provider, oauth_provider_id)
WHERE deleted_at IS NULL
  AND oauth_provider IS NOT NULL
  AND oauth_provider_id IS NOT NULL;
