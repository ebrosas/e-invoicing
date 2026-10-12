using EInvoicing.Domain.Entities;

namespace EInvoicing.Domain.Interfaces;

public interface ISalesInvoiceRepository
{
    Task<SalesInvoiceHeader?> GetInvoiceByNumberAsync(string invoiceNo, CancellationToken cancellationToken = default);
    Task<IEnumerable<SalesInvoiceDetailView>> GetRawInvoiceRowsAsync(string invoiceNo, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetAvailableInvoiceNumbersAsync(CancellationToken cancellationToken = default);
}
