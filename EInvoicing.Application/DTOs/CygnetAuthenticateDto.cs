using System.Text.Json.Serialization;

namespace EInvoicing.Application.DTOs;

public class CygnetAuthenticateRequestDto
{
    [JsonPropertyName("forceRefresh")]
    public bool ForceRefresh { get; set; }

    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

public class CygnetAuthenticateResponseDto
{
    [JsonPropertyName("token")]
    public string? Token { get; set; }

    [JsonPropertyName("expiryTimeInMinutes")]
    public int ExpiryTimeInMinutes { get; set; }

    [JsonPropertyName("requestId")]
    public string? RequestId { get; set; }

    [JsonPropertyName("errors")]
    public List<CygnetApiErrorDto>? Errors { get; set; }
}

public class CygnetApiErrorDto
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("code")]
    public string? Code { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }
}
