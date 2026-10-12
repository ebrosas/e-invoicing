using EInvoicing.Application.DTOs;
using EInvoicing.Application.Interfaces;
using EInvoicing.Domain.Exceptions;

namespace EInvoicing.Application.Commands;

public record ProcessInvoiceCommand(string InvoiceNo);

public class ProcessInvoiceCommandHandler
{
    private readonly ISalesInvoiceService _salesInvoiceService;
    private readonly ICygnetEInvoicingService _cygnetService;

    public ProcessInvoiceCommandHandler(
        ISalesInvoiceService salesInvoiceService,
        ICygnetEInvoicingService cygnetService)
    {
        _salesInvoiceService = salesInvoiceService;
        _cygnetService = cygnetService;
    }

    public async Task<ProcessInvoiceResultDto> Handle(ProcessInvoiceCommand command, CancellationToken cancellationToken = default)
    {
        var invoice = await _salesInvoiceService.GetInvoiceByNumberAsync(command.InvoiceNo, cancellationToken);
        if (invoice == null)
        {
            throw new InvoiceNotFoundException(command.InvoiceNo);
        }

        return await _cygnetService.ProcessInvoiceAsync(invoice, cancellationToken);
    }
}
