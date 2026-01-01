CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipe_id UUID NOT NULL REFERENCES pipes(id) ON DELETE CASCADE,
    status_code INT NOT NULL,
    request_payload JSONB NOT NULL,
    transformed_payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_pipe_id ON events(pipe_id);
