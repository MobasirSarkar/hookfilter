DROP INDEX IF EXISTS idx_pipes_slug_active;

ALTER TABLE pipes
ADD CONSTRAINT pipes_slug_key UNIQUE (slug);
