-- Optional demo data for the first user (run after create_shelf_items_table.sql)
-- Uses the first 8 books in your database. Change user_id if needed.

INSERT INTO shelf_items (user_id, book_id, status, progress_percent, current_page, total_pages, started_at, finished_at)
SELECT
    1,
    ranked.id,
    ranked.status,
    ranked.progress_percent,
    ranked.current_page,
    ranked.total_pages,
    ranked.started_at,
    ranked.finished_at
FROM (
    SELECT
        b.id,
        CASE ((ROW_NUMBER() OVER (ORDER BY b.id) - 1) % 4)
            WHEN 0 THEN 'reading'
            WHEN 1 THEN 'reading'
            WHEN 2 THEN 'finished'
            ELSE 'wishlist'
        END AS status,
        CASE ((ROW_NUMBER() OVER (ORDER BY b.id) - 1) % 4)
            WHEN 0 THEN 42
            WHEN 1 THEN 43
            WHEN 2 THEN 100
            ELSE 0
        END AS progress_percent,
        CASE ((ROW_NUMBER() OVER (ORDER BY b.id) - 1) % 4)
            WHEN 0 THEN 88
            WHEN 1 THEN 173
            ELSE NULL
        END AS current_page,
        CASE ((ROW_NUMBER() OVER (ORDER BY b.id) - 1) % 4)
            WHEN 0 THEN 210
            WHEN 1 THEN 402
            ELSE NULL
        END AS total_pages,
        CASE
            WHEN ((ROW_NUMBER() OVER (ORDER BY b.id) - 1) % 4) IN (0, 1) THEN NOW() - INTERVAL '3 days'
            WHEN ((ROW_NUMBER() OVER (ORDER BY b.id) - 1) % 4) = 2 THEN NOW() - INTERVAL '14 days'
            ELSE NULL
        END AS started_at,
        CASE
            WHEN ((ROW_NUMBER() OVER (ORDER BY b.id) - 1) % 4) = 2 THEN NOW() - INTERVAL '5 days'
            ELSE NULL
        END AS finished_at
    FROM books b
    ORDER BY b.id
    LIMIT 8
) AS ranked
ON CONFLICT (user_id, book_id) DO NOTHING;
