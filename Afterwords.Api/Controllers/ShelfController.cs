using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Afterwords.Api.Models;
using Afterwords.Api.Services;

namespace Afterwords.Api.Controllers;

[ApiController]
[Route("api/shelf")]
[Authorize]
public class ShelfController : ControllerBase
{
    private readonly ShelfService _shelfService;

    public ShelfController(ShelfService shelfService)
    {
        _shelfService = shelfService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyShelf()
    {
        try
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized(new { error = "Invalid user session." });
            }

            var shelf = await _shelfService.GetShelfForUserAsync(userId);
            return Ok(shelf);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("book/{bookId:int}")]
    public async Task<IActionResult> GetShelfItemForBook(int bookId)
    {
        try
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized(new { error = "Invalid user session." });
            }

            var item = await _shelfService.GetShelfItemForBookAsync(userId, bookId);
            if (item is null)
            {
                return NotFound();
            }

            return Ok(item);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddToShelf([FromBody] AddToShelfRequest request)
    {
        try
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized(new { error = "Invalid user session." });
            }

            var (item, error) = await _shelfService.AddToShelfAsync(userId, request);
            if (error is not null || item is null)
            {
                var message = error ?? "Could not add book to shelf.";
                if (message is "Book not found." or "A valid book is required."
                    or "Status must be reading, finished, or wishlist.")
                {
                    return BadRequest(new { error = message });
                }

                return StatusCode(500, new { error = message });
            }

            return Ok(item);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPatch("{bookId:int}")]
    public async Task<IActionResult> UpdateShelfItem(int bookId, [FromBody] UpdateShelfRequest request)
    {
        try
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized(new { error = "Invalid user session." });
            }

            var (item, error) = await _shelfService.UpdateShelfItemAsync(userId, bookId, request);
            if (error is not null || item is null)
            {
                var message = error ?? "Could not update shelf item.";
                if (message is "Book is not on your shelf." or "A valid book is required."
                    or "Status must be reading, finished, or wishlist."
                    or "Progress must be between 0 and 100.")
                {
                    return BadRequest(new { error = message });
                }

                return StatusCode(500, new { error = message });
            }

            return Ok(item);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{bookId:int}")]
    public async Task<IActionResult> RemoveFromShelf(int bookId)
    {
        try
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized(new { error = "Invalid user session." });
            }

            var removed = await _shelfService.RemoveFromShelfAsync(userId, bookId);
            if (!removed)
            {
                return NotFound(new { error = "Book is not on your shelf." });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue("sub");

        return int.TryParse(userIdClaim, out userId);
    }
}
