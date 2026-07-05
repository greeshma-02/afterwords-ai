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

    public async Task<Reflection?> CreateReflectionAsync(CreateReflectionRequest request)
    {
        const string query = @"
            INSERT INTO reflections (book_id, title, body, moods, contains_spoilers, visibility, author_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id";

        var moods = string.Join(",", request.Moods);
        var authorName = string.IsNullOrWhiteSpace(request.AuthorName)
            ? "Anonymous"
            : request.AuthorName.Trim();

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(request.BookId);
        command.Parameters.AddWithValue(request.Title.Trim());
        command.Parameters.AddWithValue(request.Body.Trim());
        command.Parameters.AddWithValue(moods);
        command.Parameters.AddWithValue(request.ContainsSpoilers);
        command.Parameters.AddWithValue(request.Visibility);
        command.Parameters.AddWithValue(authorName);

        var newId = await command.ExecuteScalarAsync();
        if (newId is null) return null;

        return await GetReflectionByIdAsync(Convert.ToInt32(newId));
    }

    public async Task<Reflection?> GetReflectionByIdAsync(int id)
    {
        const string query = @"
            SELECT r.id, r.book_id, r.title, r.body, r.moods, r.contains_spoilers, r.visibility,
                   r.author_name, r.likes_count, r.comments_count, r.created_at,
                   b.title, b.author
            FROM reflections r
            INNER JOIN books b ON b.id = r.book_id
            WHERE r.id = $1";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(id);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return ReadReflection(reader);
    }

    public async Task<List<Reflection>> GetReflectionsByBookIdAsync(int bookId)
    {
        const string query = @"
            SELECT r.id, r.book_id, r.title, r.body, r.moods, r.contains_spoilers, r.visibility,
                   r.author_name, r.likes_count, r.comments_count, r.created_at,
                   b.title, b.author
            FROM reflections r
            INNER JOIN books b ON b.id = r.book_id
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

    private static Reflection ReadReflection(NpgsqlDataReader reader)
    {
        return new Reflection
        {
            Id = reader.GetInt32(0),
            BookId = reader.GetInt32(1),
            Title = reader.GetString(2),
            Body = reader.GetString(3),
            Moods = reader.IsDBNull(4) ? "" : reader.GetString(4),
            ContainsSpoilers = reader.GetBoolean(5),
            Visibility = reader.GetString(6),
            AuthorName = reader.GetString(7),
            LikesCount = reader.GetInt32(8),
            CommentsCount = reader.GetInt32(9),
            CreatedAt = reader.GetDateTime(10),
            BookTitle = reader.GetString(11),
            BookAuthor = reader.GetString(12),
        };
    }
}
