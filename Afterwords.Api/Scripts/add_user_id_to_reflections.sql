-- Link reflections to the signed-in user (safe to re-run)
ALTER TABLE reflections
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
