-- Reflections table for saved reader reflections
CREATE TABLE IF NOT EXISTS reflections (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL,
    moods TEXT NOT NULL DEFAULT '',
    contains_spoilers BOOLEAN NOT NULL DEFAULT FALSE,
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    author_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reflections_book_id ON reflections(book_id);
CREATE INDEX IF NOT EXISTS idx_reflections_visibility ON reflections(visibility);
