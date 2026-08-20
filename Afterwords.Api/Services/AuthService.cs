using Google.Apis.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Afterwords.Api.Models;

namespace Afterwords.Api.Services;

public class AuthService
{
    private readonly string _connectionString;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public AuthService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<AuthUserResponse?> SignUpAsync(SignUpRequest request)
    {
        var fullName = request.FullName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var password = request.Password;

        if (string.IsNullOrWhiteSpace(fullName))
        {
            throw new InvalidOperationException("Full name is required.");
        }

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            throw new InvalidOperationException("A valid email address is required.");
        }

        if (password.Length < 8)
        {
            throw new InvalidOperationException("Password must be at least 8 characters.");
        }

        if (await EmailExistsAsync(email))
        {
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        const string insertQuery = @"
            INSERT INTO users (full_name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, full_name, email, password_hash, google_id, avatar_url, created_at, updated_at";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(insertQuery, connection);
        command.Parameters.AddWithValue(fullName);
        command.Parameters.AddWithValue(email);
        command.Parameters.AddWithValue(passwordHash);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            return null;
        }

        var user = ReadUser(reader);
        return BuildAuthResponse(user);
    }

    public async Task<AuthUserResponse?> SignInAsync(SignInRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var password = request.Password;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException("Email and password are required.");
        }

        var user = await GetUserByEmailAsync(email);
        if (user is null || string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        return BuildAuthResponse(user);
    }

    public async Task<AuthUserResponse?> SignInWithGoogleAsync(GoogleAuthRequest request)
    {
        GoogleProfile? googleProfile = null;

        if (!string.IsNullOrWhiteSpace(request.Credential))
        {
            googleProfile = await VerifyGoogleCredentialAsync(request.Credential);
        }
        else if (!string.IsNullOrWhiteSpace(request.AccessToken))
        {
            googleProfile = await FetchGoogleProfileAsync(request.AccessToken);
        }
        else
        {
            throw new InvalidOperationException("Google credential is required.");
        }

        if (googleProfile is null || string.IsNullOrWhiteSpace(googleProfile.Email))
        {
            throw new InvalidOperationException("Could not verify Google account.");
        }

        var email = googleProfile.Email.Trim().ToLowerInvariant();
        var existingByGoogle = await GetUserByGoogleIdAsync(googleProfile.Sub);
        if (existingByGoogle is not null)
        {
            if (!string.IsNullOrWhiteSpace(googleProfile.Picture))
            {
                await UpdateAvatarAsync(existingByGoogle.Id, googleProfile.Picture);
                existingByGoogle.AvatarUrl = googleProfile.Picture;
            }

            return BuildAuthResponse(existingByGoogle);
        }

        var existingByEmail = await GetUserByEmailAsync(email);
        if (existingByEmail is not null)
        {
            await LinkGoogleAccountAsync(
                existingByEmail.Id,
                googleProfile.Sub,
                googleProfile.Picture);

            existingByEmail.GoogleId = googleProfile.Sub;
            existingByEmail.AvatarUrl = googleProfile.Picture ?? existingByEmail.AvatarUrl;
            if (string.IsNullOrWhiteSpace(existingByEmail.FullName) && !string.IsNullOrWhiteSpace(googleProfile.Name))
            {
                existingByEmail.FullName = googleProfile.Name;
            }

            return BuildAuthResponse(existingByEmail);
        }

        var newUser = await CreateGoogleUserAsync(
            googleProfile.Name ?? email,
            email,
            googleProfile.Sub,
            googleProfile.Picture);

        return newUser is null ? null : BuildAuthResponse(newUser);
    }

    private async Task<bool> EmailExistsAsync(string email)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(
            "SELECT 1 FROM users WHERE email = $1 LIMIT 1",
            connection);
        command.Parameters.AddWithValue(email);

        var result = await command.ExecuteScalarAsync();
        return result is not null;
    }

    private async Task<User?> GetUserByEmailAsync(string email)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(
            @"SELECT id, full_name, email, password_hash, google_id, avatar_url, created_at, updated_at
              FROM users WHERE email = $1 LIMIT 1",
            connection);
        command.Parameters.AddWithValue(email);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadUser(reader) : null;
    }

    private async Task<User?> GetUserByGoogleIdAsync(string googleId)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(
            @"SELECT id, full_name, email, password_hash, google_id, avatar_url, created_at, updated_at
              FROM users WHERE google_id = $1 LIMIT 1",
            connection);
        command.Parameters.AddWithValue(googleId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadUser(reader) : null;
    }

    private async Task<User?> CreateGoogleUserAsync(
        string fullName,
        string email,
        string googleId,
        string? avatarUrl)
    {
        const string insertQuery = @"
            INSERT INTO users (full_name, email, google_id, avatar_url)
            VALUES ($1, $2, $3, $4)
            RETURNING id, full_name, email, password_hash, google_id, avatar_url, created_at, updated_at";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(insertQuery, connection);
        command.Parameters.AddWithValue(fullName);
        command.Parameters.AddWithValue(email);
        command.Parameters.AddWithValue(googleId);
        command.Parameters.AddWithValue((object?)avatarUrl ?? DBNull.Value);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadUser(reader) : null;
    }

    private async Task LinkGoogleAccountAsync(int userId, string googleId, string? avatarUrl)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(
            @"UPDATE users
              SET google_id = $1,
                  avatar_url = COALESCE($2, avatar_url),
                  updated_at = NOW()
              WHERE id = $3",
            connection);
        command.Parameters.AddWithValue(googleId);
        command.Parameters.AddWithValue((object?)avatarUrl ?? DBNull.Value);
        command.Parameters.AddWithValue(userId);

        await command.ExecuteNonQueryAsync();
    }

    private async Task UpdateAvatarAsync(int userId, string avatarUrl)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(
            "UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2",
            connection);
        command.Parameters.AddWithValue(avatarUrl);
        command.Parameters.AddWithValue(userId);

        await command.ExecuteNonQueryAsync();
    }

    private async Task<GoogleProfile?> VerifyGoogleCredentialAsync(string credential)
    {
        var clientIds = GetGoogleClientIds();
        if (clientIds.Length == 0)
        {
            throw new InvalidOperationException(
                "Google client ID is not configured. Set Google:ClientId in appsettings.json to match VITE_GOOGLE_CLIENT_ID.");
        }

        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(
                credential,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = clientIds,
                });

            return new GoogleProfile
            {
                Sub = payload.Subject,
                Email = payload.Email,
                Name = payload.Name,
                Picture = payload.Picture,
            };
        }
        catch (InvalidJwtException ex)
        {
            throw new InvalidOperationException(
                "Google sign-in could not be verified. Ensure Google:ClientId matches your web client ID.",
                ex);
        }
    }

    private string[] GetGoogleClientIds()
    {
        var configured = _configuration["Google:ClientId"]
            ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID")
            ?? string.Empty;

        return configured
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    private async Task<GoogleProfile?> FetchGoogleProfileAsync(string accessToken)
    {
        var client = _httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            "https://www.googleapis.com/oauth2/v3/userinfo");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync();
        return await JsonSerializer.DeserializeAsync<GoogleProfile>(stream);
    }

    private AuthUserResponse BuildAuthResponse(User user)
    {
        return new AuthUserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            Token = GenerateJwtToken(user),
        };
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is not configured.");
        var issuer = _configuration["Jwt:Issuer"] ?? "Afterwords.Api";
        var audience = _configuration["Jwt:Audience"] ?? "Afterwords.Web";
        var expiresMinutes = int.TryParse(_configuration["Jwt:ExpiresMinutes"], out var minutes)
            ? minutes
            : 10080;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static User ReadUser(NpgsqlDataReader reader)
    {
        return new User
        {
            Id = reader.GetInt32(0),
            FullName = reader.GetString(1),
            Email = reader.GetString(2),
            PasswordHash = reader.IsDBNull(3) ? null : reader.GetString(3),
            GoogleId = reader.IsDBNull(4) ? null : reader.GetString(4),
            AvatarUrl = reader.IsDBNull(5) ? null : reader.GetString(5),
            CreatedAt = reader.GetDateTime(6),
            UpdatedAt = reader.GetDateTime(7),
        };
    }

    private sealed class GoogleProfile
    {
        [JsonPropertyName("sub")]
        public string Sub { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("picture")]
        public string? Picture { get; set; }
    }
}
