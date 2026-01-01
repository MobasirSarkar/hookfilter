CREATE TABLE IF NOT EXISTS pipes (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   name TEXT NOT NULL,
   slug TEXT NOT NULL UNIQUE,
   target_url TEXT NOT NULL,
   jq_filter TEXT NOT NULL DEFAULT '.',
   is_active BOOLEAN NOT NULL DEFAULT true,
   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
   updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
   deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_pipes_slug ON pipes(slug);
CREATE INDEX IF NOT EXISTS idx_pipes_deleted_at ON pipes(deleted_at);
