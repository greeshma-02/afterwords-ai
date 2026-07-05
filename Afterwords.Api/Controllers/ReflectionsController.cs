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

    [HttpPost]
    public async Task<IActionResult> CreateReflection([FromBody] CreateReflectionRequest request)
    {
        try
        {
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

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetReflection(int id)
    {
        try
        {
            var reflection = await _reflectionService.GetReflectionByIdAsync(id);
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
}
