using Microsoft.AspNetCore.Mvc;
using Afterwords.Api.Models;
using Afterwords.Api.Services;

namespace Afterwords.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        try
        {
            var result = await _authService.SignUpAsync(request);
            if (result is null)
            {
                return StatusCode(500, new { error = "Could not create account." });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
    {
        try
        {
            var result = await _authService.SignInAsync(request);
            if (result is null)
            {
                return Unauthorized(new { error = "Invalid email or password." });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleSignIn([FromBody] GoogleAuthRequest request)
    {
        try
        {
            var result = await _authService.SignInWithGoogleAsync(request);
            if (result is null)
            {
                return Unauthorized(new { error = "Google sign-in failed." });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
