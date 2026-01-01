ALTER TABLE pipes DROP CONSTRAINT IF EXISTS pipes_slug_key;

CREATE UNIQUE INDEX idx_pipes_slug_active 
ON pipes (slug) 
WHERE deleted_at IS NULL;
