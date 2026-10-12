namespace EInvoicing.Domain.Entities;

public class EInvoiceSubmissionLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string InvoiceNo { get; set; } = string.Empty;
    public string ReferenceId { get; set; } = string.Empty;
    public DateTime SubmissionTimeUtc { get; set; } = DateTime.UtcNow;
    public bool IsSuccess { get; set; }
    public string StatusMessage { get; set; } = string.Empty;
    public string RequestPayloadJson { get; set; } = string.Empty;
    public string ResponsePayloadJson { get; set; } = string.Empty;
}
