namespace EInvoicing.Application.DTOs;

public class ProcessInvoiceResultDto
{
    public bool Success { get; set; }
    public string InvoiceNo { get; set; } = string.Empty;
    public string? ReferenceId { get; set; }
    public string? TokenUsed { get; set; }
    public bool TokenFromCache { get; set; }
    public DateTime ProcessedAtUtc { get; set; } = DateTime.UtcNow;
    public string Message { get; set; } = string.Empty;
    public string? RawRequestPayload { get; set; }
    public string? RawResponsePayload { get; set; }
    public List<string> ValidationErrors { get; set; } = new();
}
