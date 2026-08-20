namespace Afterwords.Api.Models;

public class CreateReflectionRequest
{
    public int BookId { get; set; }
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public List<string> Moods { get; set; } = new();
    public bool ContainsSpoilers { get; set; }
    public string Visibility { get; set; } = "public";
    public string? AuthorName { get; set; }
    public int? UserId { get; set; }
}
