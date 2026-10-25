using Npgsql;
using Afterwords.Api.Models;

namespace Afterwords.Api.Services;

public class BookService
{
    private readonly string _connectionString;

    public BookService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public async Task<List<Book>> GetBooksAsync()
    {
        var books = new List<Book>();

        string query = @"SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books 
                         ORDER BY id DESC 
                         LIMIT 20";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            books.Add(ReadBook(reader));
        }

        return books;
    }

    public async Task<List<Book>> SearchBooksAsync(string emotion)
    {
        var books = new List<Book>();

        string query = emotion.ToLower() switch
        {
            "comfort" => @"
                SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books
                WHERE comfort >= 4
                ORDER BY comfort DESC, hope DESC, connection DESC
                LIMIT 10",

            "sadness" => @"
                SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books
                WHERE sadness >= 4
                ORDER BY sadness DESC, connection DESC
                LIMIT 10",

            "hope" => @"
                SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books
                WHERE hope >= 4
                ORDER BY hope DESC, comfort DESC
                LIMIT 10",

            "joy" => @"
                SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books
                WHERE joy >= 4
                ORDER BY joy DESC, comfort DESC
                LIMIT 10",

            "humor" => @"
                SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books
                WHERE humor >= 4
                ORDER BY humor DESC, joy DESC
                LIMIT 10",

            "friendship" => @"
                SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books
                WHERE connection >= 4
                ORDER BY connection DESC, comfort DESC, hope DESC
                LIMIT 10",

            "calm" => @"
                SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books
                WHERE intensity <= 2
                ORDER BY intensity ASC, comfort DESC
                LIMIT 10",

            _ => @"
                SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books
                ORDER BY comfort DESC, hope DESC
                LIMIT 10"
        };

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            books.Add(ReadBook(reader));
        }

        return books;
    }

    public async Task<Book?> GetBookByIdAsync(int id)
    {
        string query = @"SELECT id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity FROM books WHERE id = $1";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue(id);

        await using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return ReadBook(reader);
        }

        return null;
    }

    /// <summary>
    /// Reads a row from the reader. Expects SELECT order: id, title, author, isbn, image_url, description, sadness, comfort, hope, joy, humor, connection, intensity.
    /// </summary>
    private Book ReadBook(NpgsqlDataReader reader)
    {
        return new Book
        {
            Id = reader.GetInt32(0),
            Title = reader.GetString(1),
            Author = reader.GetString(2),

            Isbn = GetStringOrEmpty(reader, 3),
            ImageUrl = GetStringOrEmpty(reader, 4),
            Description = GetStringOrEmpty(reader, 5),

            Sadness = reader.GetInt32(6),
            Comfort = reader.GetInt32(7),
            Hope = reader.GetInt32(8),
            Joy = reader.GetInt32(9),
            Humor = reader.GetInt32(10),
            Connection = reader.GetInt32(11),
            Intensity = reader.GetInt32(12)
        };
    }

    private static string GetStringOrEmpty(NpgsqlDataReader reader, int ordinal)
    {
        return reader.IsDBNull(ordinal) ? "" : reader.GetString(ordinal);
    }
}
