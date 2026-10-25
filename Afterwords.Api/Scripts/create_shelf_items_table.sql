-- User shelf: books saved with reading status and progress
CREATE TABLE IF NOT EXISTS shelf_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'wishlist'
        CHECK (status IN ('reading', 'finished', 'wishlist')),
    progress_percent INTEGER NOT NULL DEFAULT 0
        CHECK (progress_percent >= 0 AND progress_percent <= 100),
    current_page INTEGER,
    total_pages INTEGER,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_shelf_items_user_id ON shelf_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shelf_items_status ON shelf_items(status);
