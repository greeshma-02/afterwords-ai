namespace Afterwords.Api.Models;

public class Reflection
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public int? UserId { get; set; }

    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public string Moods { get; set; } = "";
    public bool ContainsSpoilers { get; set; }
    public string Visibility { get; set; } = "public";
    public string AuthorName { get; set; } = "Anonymous";

    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public DateTime CreatedAt { get; set; }

    public string BookTitle { get; set; } = "";
    public string BookAuthor { get; set; } = "";
}
