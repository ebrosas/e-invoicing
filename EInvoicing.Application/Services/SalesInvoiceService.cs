using EInvoicing.Application.Commands;
using EInvoicing.Application.DTOs;
using EInvoicing.Application.Interfaces;
using EInvoicing.Application.Queries;
using EInvoicing.Domain.Interfaces;

namespace EInvoicing.Application.Services;

public class SalesInvoiceService : ISalesInvoiceService
{
    private readonly ISalesInvoiceRepository _repository;
    private readonly ICygnetEInvoicingService _cygnetService;

    public SalesInvoiceService(
        ISalesInvoiceRepository repository,
        ICygnetEInvoicingService cygnetService)
    {
        _repository = repository;
        _cygnetService = cygnetService;
    }

    public async Task<SalesInvoiceDto?> GetInvoiceByNumberAsync(string invoiceNo, CancellationToken cancellationToken = default)
    {
        var handler = new GetInvoiceByNumberQueryHandler(_repository);
        return await handler.Handle(new GetInvoiceByNumberQuery(invoiceNo), cancellationToken);
    }

    public async Task<IEnumerable<string>> GetRecentInvoiceNumbersAsync(CancellationToken cancellationToken = default)
    {
        return await _repository.GetAvailableInvoiceNumbersAsync(cancellationToken);
    }

    public async Task<ProcessInvoiceResultDto> ProcessInvoiceAsync(string invoiceNo, CancellationToken cancellationToken = default)
    {
        var handler = new ProcessInvoiceCommandHandler(this, _cygnetService);
        return await handler.Handle(new ProcessInvoiceCommand(invoiceNo), cancellationToken);
    }
}
