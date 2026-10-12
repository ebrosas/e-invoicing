namespace EInvoicing.Domain.Entities;

public class CygnetAuthToken
{
    public string Token { get; set; } = string.Empty;
    public int ExpiryTimeInMinutes { get; set; } = 360; // 6 hours predefined lifetime
    public DateTime IssuedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAtUtc => IssuedAtUtc.AddMinutes(ExpiryTimeInMinutes);

    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;

    /// <summary>
    /// Checks if token is within 10 minutes of expiry, indicating a need for forceRefresh.
    /// </summary>
    public bool NeedsRefreshSoon => DateTime.UtcNow >= ExpiresAtUtc.AddMinutes(-10);
}
