using EInvoicing.Application.DTOs;
using EInvoicing.Domain.Interfaces;

namespace EInvoicing.Application.Queries;

public record GetInvoiceByNumberQuery(string InvoiceNo);

public class GetInvoiceByNumberQueryHandler
{
    private readonly ISalesInvoiceRepository _repository;

    public GetInvoiceByNumberQueryHandler(ISalesInvoiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<SalesInvoiceDto?> Handle(GetInvoiceByNumberQuery query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query.InvoiceNo))
            return null;

        var header = await _repository.GetInvoiceByNumberAsync(query.InvoiceNo.Trim(), cancellationToken);
        if (header == null)
            return null;

        return new SalesInvoiceDto
        {
            InvoiceNo = header.InvoiceNo,
            InvoiceDate = header.InvoiceDate,
            DeliveryOrderNo = header.DeliveryOrderNo,
            DeliveryOrderDate = header.DeliveryOrderDate,
            CustomerNo = header.CustomerNo,
            CustomerName = header.CustomerName,
            CustomerAddress = header.CustomerAddress,
            CustomerEmail = header.CustomerEmail,
            CustomerContactNo = header.CustomerContactNo,
            PaymentTerms = header.PaymentTerms,
            NetDueDate = header.NetDueDate,
            Currency = header.CurrencyCode,
            TotalWeightMetricTons = header.Lines.Sum(l => l.WeightMetricTons),
            TotalLineNetAmountBHD = header.TotalLineNetAmountBHD,
            TotalTaxAmountBHD = header.TotalTaxAmountBHD,
            TotalInvoiceAmountBHD = header.TotalInvoiceAmountBHD,
            Lines = header.Lines.Select(l => new SalesInvoiceLineDto
            {
                LineNumber = l.LineNumber,
                ItemCode = l.ItemCode,
                ItemDescription = l.ItemDescription,
                WeightMetricTons = l.WeightMetricTons,
                UnitPrice = l.UnitPrice,
                Value = l.Value,
                UnitPriceBHD = l.UnitPriceBHD,
                ValueBHD = l.ValueBHD,
                VatRate = l.VatRate,
                VatAmountBHD = l.VatAmountBHD,
                VatCategoryCode = l.VatCategoryCode
            }).ToList()
        };
    }
}
