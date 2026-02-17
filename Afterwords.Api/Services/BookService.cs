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

        string query = @"SELECT * FROM books 
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
                SELECT * FROM books
                WHERE comfort >= 4
                ORDER BY comfort DESC, hope DESC, connection DESC
                LIMIT 10",

            "sadness" => @"
                SELECT * FROM books
                WHERE sadness >= 4
                ORDER BY sadness DESC, connection DESC
                LIMIT 10",

            "hope" => @"
                SELECT * FROM books
                WHERE hope >= 4
                ORDER BY hope DESC, comfort DESC
                LIMIT 10",

            "joy" => @"
                SELECT * FROM books
                WHERE joy >= 4
                ORDER BY joy DESC, comfort DESC
                LIMIT 10",

            "humor" => @"
                SELECT * FROM books
                WHERE humor >= 4
                ORDER BY humor DESC, joy DESC
                LIMIT 10",

            "friendship" => @"
                SELECT * FROM books
                WHERE connection >= 4
                ORDER BY connection DESC, comfort DESC, hope DESC
                LIMIT 10",

            "calm" => @"
                SELECT * FROM books
                WHERE intensity <= 2
                ORDER BY intensity ASC, comfort DESC
                LIMIT 10",

            _ => @"
                SELECT * FROM books
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

    private Book ReadBook(NpgsqlDataReader reader)
    {
        return new Book
        {
            Id = reader.GetInt32(0),
            Title = reader.GetString(1),
            Author = reader.GetString(2),
            Sadness = reader.GetInt32(5),
            Comfort = reader.GetInt32(6),
            Hope = reader.GetInt32(7),
            Joy = reader.GetInt32(8),
            Humor = reader.GetInt32(9),
            Connection = reader.GetInt32(10),
            Intensity = reader.GetInt32(11)
        };
    }
}
