namespace Afterwords.Api.Models;

public class AddToShelfRequest
{
    public int BookId { get; set; }
    /// <summary>reading | finished | wishlist (default: wishlist)</summary>
    public string Status { get; set; } = "wishlist";
}

public class UpdateShelfRequest
{
    /// <summary>reading | finished | wishlist</summary>
    public string? Status { get; set; }
    public int? ProgressPercent { get; set; }
}

public class ShelfItemResponse
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public int? CurrentPage { get; set; }
    public int? TotalPages { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool HasReflection { get; set; }
    public int? ReflectionId { get; set; }
    public int? Sadness { get; set; }
    public int? Comfort { get; set; }
    public int? Hope { get; set; }
    public int? Joy { get; set; }
    public int? Humor { get; set; }
    public int? Connection { get; set; }
}

public class ShelfSummaryResponse
{
    public List<ShelfItemResponse> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int ReadingCount { get; set; }
    public int FinishedCount { get; set; }
    public int WishlistCount { get; set; }
    public List<MoodShelfCount> MoodShelves { get; set; } = [];
}

public class MoodShelfCount
{
    public string Mood { get; set; } = string.Empty;
    public int Count { get; set; }
}
