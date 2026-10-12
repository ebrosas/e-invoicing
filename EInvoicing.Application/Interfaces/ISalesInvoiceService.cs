using EInvoicing.Application.DTOs;

namespace EInvoicing.Application.Interfaces;

public interface ISalesInvoiceService
{
    Task<SalesInvoiceDto?> GetInvoiceByNumberAsync(string invoiceNo, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetRecentInvoiceNumbersAsync(CancellationToken cancellationToken = default);
    Task<ProcessInvoiceResultDto> ProcessInvoiceAsync(string invoiceNo, CancellationToken cancellationToken = default);
}
