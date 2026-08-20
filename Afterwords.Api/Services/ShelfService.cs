using Npgsql;
using Afterwords.Api.Models;

namespace Afterwords.Api.Services;

public class ShelfService
{
    private readonly string _connectionString;

    public ShelfService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    private const string ShelfItemSelect = @"
            SELECT
                s.id,
                s.book_id,
                b.title,
                b.author,
                b.image_url,
                s.status,
                s.progress_percent,
                s.current_page,
                s.total_pages,
                s.started_at,
                s.finished_at,
                s.created_at,
                b.sadness,
                b.comfort,
                b.hope,
                b.joy,
                b.humor,
                b.connection,
                (
                    SELECT r.id
                    FROM reflections r
                    WHERE r.book_id = s.book_id
                      AND (r.user_id = s.user_id OR r.user_id IS NULL)
                    ORDER BY r.created_at DESC
                    LIMIT 1
                ) AS reflection_id
            FROM shelf_items s
            INNER JOIN books b ON b.id = s.book_id";

    public async Task<ShelfSummaryResponse> GetShelfForUserAsync(int userId)
    {
        var query = $@"{ShelfItemSelect}
            WHERE s.user_id = $1
            ORDER BY s.updated_at DESC, s.id DESC";

        var items = new List<ShelfItemResponse>();

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(userId);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            items.Add(ReadShelfItem(reader));
        }

        return BuildSummary(items);
    }

    public async Task<(ShelfItemResponse? Item, string? Error)> AddToShelfAsync(
        int userId,
        AddToShelfRequest request)
    {
        var status = string.IsNullOrWhiteSpace(request.Status)
            ? "wishlist"
            : request.Status.Trim().ToLowerInvariant();

        if (status is not ("reading" or "finished" or "wishlist"))
        {
            return (null, "Status must be reading, finished, or wishlist.");
        }

        if (request.BookId <= 0)
        {
            return (null, "A valid book is required.");
        }

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using (var bookCheck = new NpgsqlCommand(
            "SELECT EXISTS(SELECT 1 FROM books WHERE id = $1)", connection))
        {
            bookCheck.Parameters.AddWithValue(request.BookId);
            var exists = (bool)(await bookCheck.ExecuteScalarAsync() ?? false);
            if (!exists)
            {
                return (null, "Book not found.");
            }
        }

        const string upsert = @"
            INSERT INTO shelf_items (
                user_id, book_id, status, progress_percent,
                started_at, finished_at, updated_at
            )
            VALUES (
                $1, $2, $3,
                CASE WHEN $3 = 'finished' THEN 100 ELSE 0 END,
                CASE WHEN $3 = 'reading' THEN NOW() ELSE NULL END,
                CASE WHEN $3 = 'finished' THEN NOW() ELSE NULL END,
                NOW()
            )
            ON CONFLICT (user_id, book_id) DO UPDATE SET
                status = EXCLUDED.status,
                progress_percent = EXCLUDED.progress_percent,
                started_at = COALESCE(shelf_items.started_at, EXCLUDED.started_at),
                finished_at = CASE
                    WHEN EXCLUDED.status = 'finished' THEN COALESCE(shelf_items.finished_at, NOW())
                    ELSE NULL
                END,
                updated_at = NOW()
            RETURNING id";

        await using var command = new NpgsqlCommand(upsert, connection);
        command.Parameters.AddWithValue(userId);
        command.Parameters.AddWithValue(request.BookId);
        command.Parameters.AddWithValue(status);

        var newId = await command.ExecuteScalarAsync();
        if (newId is null)
        {
            return (null, "Could not add book to shelf.");
        }

        var item = await GetShelfItemByIdAsync(connection, Convert.ToInt32(newId));
        return (item, item is null ? "Could not load shelf item." : null);
    }

    public async Task<ShelfItemResponse?> GetShelfItemForBookAsync(int userId, int bookId)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = $@"{ShelfItemSelect}
            WHERE s.user_id = $1 AND s.book_id = $2";

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(userId);
        command.Parameters.AddWithValue(bookId);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return ReadShelfItem(reader);
    }

    public async Task<(ShelfItemResponse? Item, string? Error)> UpdateShelfItemAsync(
        int userId,
        int bookId,
        UpdateShelfRequest request)
    {
        if (bookId <= 0)
        {
            return (null, "A valid book is required.");
        }

        if (request.Status is not null
            && request.Status.Trim().ToLowerInvariant() is not ("reading" or "finished" or "wishlist"))
        {
            return (null, "Status must be reading, finished, or wishlist.");
        }

        if (request.ProgressPercent is < 0 or > 100)
        {
            return (null, "Progress must be between 0 and 100.");
        }

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        var existing = await GetShelfItemForBookAsync(userId, bookId);
        if (existing is null)
        {
            return (null, "Book is not on your shelf.");
        }

        var status = request.Status?.Trim().ToLowerInvariant() ?? existing.Status;
        var progress = request.ProgressPercent ?? existing.ProgressPercent;
        if (status == "finished")
        {
            progress = 100;
        }

        const string update = @"
            UPDATE shelf_items
            SET
                status = $3,
                progress_percent = $4,
                started_at = CASE
                    WHEN $3 = 'reading' THEN COALESCE(started_at, NOW())
                    ELSE started_at
                END,
                finished_at = CASE
                    WHEN $3 = 'finished' THEN COALESCE(finished_at, NOW())
                    ELSE NULL
                END,
                updated_at = NOW()
            WHERE user_id = $1 AND book_id = $2
            RETURNING id";

        await using var command = new NpgsqlCommand(update, connection);
        command.Parameters.AddWithValue(userId);
        command.Parameters.AddWithValue(bookId);
        command.Parameters.AddWithValue(status);
        command.Parameters.AddWithValue(progress);

        var updatedId = await command.ExecuteScalarAsync();
        if (updatedId is null)
        {
            return (null, "Could not update shelf item.");
        }

        var item = await GetShelfItemByIdAsync(connection, Convert.ToInt32(updatedId));
        return (item, item is null ? "Could not load shelf item." : null);
    }

    public async Task<bool> RemoveFromShelfAsync(int userId, int bookId)
    {
        if (bookId <= 0) return false;

        const string query = @"
            DELETE FROM shelf_items
            WHERE user_id = $1 AND book_id = $2";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(userId);
        command.Parameters.AddWithValue(bookId);

        var rows = await command.ExecuteNonQueryAsync();
        return rows > 0;
    }

    private static async Task<ShelfItemResponse?> GetShelfItemByIdAsync(
        NpgsqlConnection connection,
        int id)
    {
        var query = $@"{ShelfItemSelect}
            WHERE s.id = $1";

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(id);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return ReadShelfItem(reader);
    }

    private static ShelfItemResponse ReadShelfItem(NpgsqlDataReader reader)
    {
        return new ShelfItemResponse
        {
            Id = reader.GetInt32(0),
            BookId = reader.GetInt32(1),
            Title = reader.GetString(2),
            Author = reader.GetString(3),
            ImageUrl = reader.IsDBNull(4) ? null : reader.GetString(4),
            Status = reader.GetString(5),
            ProgressPercent = reader.GetInt32(6),
            CurrentPage = reader.IsDBNull(7) ? null : reader.GetInt32(7),
            TotalPages = reader.IsDBNull(8) ? null : reader.GetInt32(8),
            StartedAt = reader.IsDBNull(9) ? null : reader.GetDateTime(9),
            FinishedAt = reader.IsDBNull(10) ? null : reader.GetDateTime(10),
            CreatedAt = reader.GetDateTime(11),
            Sadness = reader.IsDBNull(12) ? null : reader.GetInt32(12),
            Comfort = reader.IsDBNull(13) ? null : reader.GetInt32(13),
            Hope = reader.IsDBNull(14) ? null : reader.GetInt32(14),
            Joy = reader.IsDBNull(15) ? null : reader.GetInt32(15),
            Humor = reader.IsDBNull(16) ? null : reader.GetInt32(16),
            Connection = reader.IsDBNull(17) ? null : reader.GetInt32(17),
            ReflectionId = reader.IsDBNull(18) ? null : reader.GetInt32(18),
            HasReflection = !reader.IsDBNull(18),
        };
    }

    private static ShelfSummaryResponse BuildSummary(List<ShelfItemResponse> items)
    {
        var moodCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["Comfort"] = 0,
            ["Hope"] = 0,
            ["Melancholy"] = 0,
            ["Friendship"] = 0,
        };

        foreach (var item in items)
        {
            foreach (var mood in GetMoodLabels(item))
            {
                if (moodCounts.ContainsKey(mood))
                {
                    moodCounts[mood]++;
                }
            }
        }

        return new ShelfSummaryResponse
        {
            Items = items,
            TotalCount = items.Count,
            ReadingCount = items.Count(i => i.Status == "reading"),
            FinishedCount = items.Count(i => i.Status == "finished"),
            WishlistCount = items.Count(i => i.Status == "wishlist"),
            MoodShelves = moodCounts
                .Where(pair => pair.Value > 0)
                .Select(pair => new MoodShelfCount { Mood = pair.Key, Count = pair.Value })
                .OrderByDescending(pair => pair.Count)
                .ToList(),
        };
    }

    private static IEnumerable<string> GetMoodLabels(ShelfItemResponse item)
    {
        if (item.Comfort >= 4) yield return "Comfort";
        if (item.Hope >= 4) yield return "Hope";
        if (item.Sadness >= 4) yield return "Melancholy";
        if (item.Connection >= 4) yield return "Friendship";
    }
}
