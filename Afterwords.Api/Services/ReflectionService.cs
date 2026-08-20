using Npgsql;
using Afterwords.Api.Models;

namespace Afterwords.Api.Services;

public class ReflectionService
{
    private readonly string _connectionString;

    public ReflectionService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    private const string ReflectionSelect = @"
            SELECT r.id, r.book_id, r.user_id, r.title, r.body, r.moods, r.contains_spoilers, r.visibility,
                   r.author_name, r.likes_count, r.comments_count, r.created_at,
                   b.title, b.author
            FROM reflections r
            INNER JOIN books b ON b.id = r.book_id";

    public async Task<Reflection?> CreateReflectionAsync(CreateReflectionRequest request)
    {
        const string query = @"
            INSERT INTO reflections (book_id, user_id, title, body, moods, contains_spoilers, visibility, author_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id";

        var moods = string.Join(",", request.Moods);
        var authorName = string.IsNullOrWhiteSpace(request.AuthorName)
            ? "Anonymous"
            : request.AuthorName.Trim();

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(request.BookId);
        command.Parameters.AddWithValue(request.UserId.HasValue ? request.UserId.Value : DBNull.Value);
        command.Parameters.AddWithValue(request.Title.Trim());
        command.Parameters.AddWithValue(request.Body.Trim());
        command.Parameters.AddWithValue(moods);
        command.Parameters.AddWithValue(request.ContainsSpoilers);
        command.Parameters.AddWithValue(request.Visibility);
        command.Parameters.AddWithValue(authorName);

        var newId = await command.ExecuteScalarAsync();
        if (newId is null) return null;

        return await GetReflectionByIdForViewerAsync(Convert.ToInt32(newId), request.UserId);
    }

    public async Task<Reflection?> GetReflectionByIdForViewerAsync(int id, int? viewerUserId)
    {
        var query = $@"{ReflectionSelect}
            WHERE r.id = $1";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(id);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        var reflection = ReadReflection(reader);
        if (reflection.Visibility == "private"
            && (!viewerUserId.HasValue || reflection.UserId != viewerUserId))
        {
            return null;
        }

        return reflection;
    }

    public async Task<List<Reflection>> GetReflectionsForUserAsync(int userId)
    {
        var query = $@"{ReflectionSelect}
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC";

        var reflections = new List<Reflection>();

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(userId);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            reflections.Add(ReadReflection(reader));
        }

        return reflections;
    }

    public async Task<List<Reflection>> GetReflectionsByBookIdAsync(int bookId)
    {
        var query = $@"{ReflectionSelect}
            WHERE r.book_id = $1 AND r.visibility = 'public'
            ORDER BY r.created_at DESC
            LIMIT 20";

        var reflections = new List<Reflection>();

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(bookId);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            reflections.Add(ReadReflection(reader));
        }

        return reflections;
    }

    public async Task<bool> DeleteReflectionAsync(int id, int userId)
    {
        const string query = @"
            DELETE FROM reflections
            WHERE id = $1 AND user_id = $2";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(id);
        command.Parameters.AddWithValue(userId);

        var rows = await command.ExecuteNonQueryAsync();
        return rows > 0;
    }

    private static Reflection ReadReflection(NpgsqlDataReader reader)
    {
        return new Reflection
        {
            Id = reader.GetInt32(0),
            BookId = reader.GetInt32(1),
            UserId = reader.IsDBNull(2) ? null : reader.GetInt32(2),
            Title = reader.GetString(3),
            Body = reader.GetString(4),
            Moods = reader.IsDBNull(5) ? "" : reader.GetString(5),
            ContainsSpoilers = reader.GetBoolean(6),
            Visibility = reader.GetString(7),
            AuthorName = reader.GetString(8),
            LikesCount = reader.GetInt32(9),
            CommentsCount = reader.GetInt32(10),
            CreatedAt = reader.GetDateTime(11),
            BookTitle = reader.GetString(12),
            BookAuthor = reader.GetString(13),
        };
    }
}
