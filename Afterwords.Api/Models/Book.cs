namespace Afterwords.Api.Models;

public class Book
{
    public int Id { get; set; }

    public string Title { get; set; } = "";
    public string Author { get; set; } = "";

    public string Description { get; set; } = "";

    public string Isbn { get; set; } = "";
    public string ImageUrl { get; set; } = "";

    public int Sadness { get; set; }
    public int Comfort { get; set; }
    public int Hope { get; set; }
    public int Joy { get; set; }
    public int Humor { get; set; }
    public int Connection { get; set; }
    public int Intensity { get; set; }
}
