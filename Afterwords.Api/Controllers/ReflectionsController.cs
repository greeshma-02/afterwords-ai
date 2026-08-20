using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Afterwords.Api.Models;
using Afterwords.Api.Services;

namespace Afterwords.Api.Controllers;

[ApiController]
[Route("api/reflections")]
public class ReflectionsController : ControllerBase
{
    private readonly ReflectionService _reflectionService;

    public ReflectionsController(ReflectionService reflectionService)
    {
        _reflectionService = reflectionService;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateReflection([FromBody] CreateReflectionRequest request)
    {
        try
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized(new { error = "Please sign in to save a reflection." });
            }

            if (request.BookId <= 0)
            {
                return BadRequest(new { error = "A valid book is required." });
            }

            if (string.IsNullOrWhiteSpace(request.Body))
            {
                return BadRequest(new { error = "Reflection body is required." });
            }

            if (request.Visibility is not ("public" or "private"))
            {
                return BadRequest(new { error = "Visibility must be public or private." });
            }

            request.UserId = userId;
            var reflection = await _reflectionService.CreateReflectionAsync(request);
            if (reflection is null)
            {
                return StatusCode(500, new { error = "Could not save reflection." });
            }

            return CreatedAtAction(nameof(GetReflection), new { id = reflection.Id }, reflection);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyReflections()
    {
        try
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized(new { error = "Please sign in to view your reflections." });
            }

            var reflections = await _reflectionService.GetReflectionsForUserAsync(userId);
            return Ok(reflections);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetReflection(int id)
    {
        try
        {
            int? viewerUserId = TryGetUserId(out var userId) ? userId : null;
            var reflection = await _reflectionService.GetReflectionByIdForViewerAsync(id, viewerUserId);
            if (reflection is null)
            {
                return NotFound();
            }

            return Ok(reflection);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteReflection(int id)
    {
        try
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized(new { error = "Please sign in to delete a reflection." });
            }

            var deleted = await _reflectionService.DeleteReflectionAsync(id, userId);
            if (!deleted)
            {
                return NotFound(new { error = "Reflection not found." });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("book/{bookId:int}")]
    public async Task<IActionResult> GetReflectionsByBook(int bookId)
    {
        try
        {
            var reflections = await _reflectionService.GetReflectionsByBookIdAsync(bookId);
            return Ok(reflections);
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
