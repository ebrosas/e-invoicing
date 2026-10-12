using EInvoicing.Application.DTOs;

namespace EInvoicing.Application.Interfaces;

public interface ICygnetEInvoicingService
{
    Task<string> GetAuthenticationTokenAsync(bool forceRefresh = false, CancellationToken cancellationToken = default);
    Task<CygnetSaveDocumentResponseDto> SaveDocumentAsync(CygnetSaveDocumentPayloadDto documentPayload, CancellationToken cancellationToken = default);
    Task<ProcessInvoiceResultDto> ProcessInvoiceAsync(SalesInvoiceDto invoice, CancellationToken cancellationToken = default);
    bool IsSandboxMode { get; set; }
}
