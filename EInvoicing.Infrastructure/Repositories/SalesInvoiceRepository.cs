using EInvoicing.Domain.Entities;
using EInvoicing.Domain.Interfaces;
using EInvoicing.Infrastructure.Data;
using EInvoicing.Infrastructure.Data.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EInvoicing.Infrastructure.Repositories;

public class SalesInvoiceRepository : ISalesInvoiceRepository
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<SalesInvoiceRepository> _logger;

    public SalesInvoiceRepository(AppDbContext dbContext, ILogger<SalesInvoiceRepository> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<SalesInvoiceHeader?> GetInvoiceByNumberAsync(string invoiceNo, CancellationToken cancellationToken = default)
    {
        var rows = await GetRawInvoiceRowsAsync(invoiceNo, cancellationToken);
        var rowList = rows.ToList();

        if (!rowList.Any())
            return null;

        var firstRow = rowList.First();

        var header = new SalesInvoiceHeader
        {
            InvoiceNo = firstRow.InvoiceNo,
            InvoiceDate = firstRow.InvoiceDate,
            DeliveryOrderNo = firstRow.DeliveryOrderNo,
            DeliveryOrderDate = firstRow.DeliveryOrderDate,
            CustomerNo = firstRow.CustomerNo,
            CustomerName = firstRow.CustomerName,
            CustomerAddress = firstRow.CustomerAddress,
            CustomerEmail = firstRow.CustomerEmail,
            CustomerContactNo = firstRow.CustomerContactNo,
            PaymentTerms = firstRow.PaymentTerms,
            NetDueDate = firstRow.NetDueDate,
            CurrencyCode = "BHD",
            Lines = rowList.OrderBy(r => r.LineNumber).Select(r => new SalesInvoiceLine
            {
                LineNumber = r.LineNumber,
                ItemCode = r.ItemCode,
                ItemDescription = r.ItemDescription,
                WeightMetricTons = r.WeightMetricTons,
                UnitPrice = r.UnitPrice,
                Value = r.Value,
                UnitPriceBHD = r.UnitPriceBHD,
                ValueBHD = r.ValueBHD,
                VatRate = r.VatRate,
                VatAmountBHD = r.VatAmountBHD,
                VatCategoryCode = r.VatCategoryCode
            }).ToList()
        };

        header.TotalLineNetAmountBHD = header.Lines.Sum(l => l.ValueBHD);
        header.TotalTaxAmountBHD = header.Lines.Sum(l => l.VatAmountBHD);
        header.TotalInvoiceAmountBHD = header.TotalLineNetAmountBHD + header.TotalTaxAmountBHD;

        return header;
    }

    public async Task<IEnumerable<SalesInvoiceDetailView>> GetRawInvoiceRowsAsync(string invoiceNo, CancellationToken cancellationToken = default)
    {
        try
        {
            // Query SQL Server view secuser.Vw_SalesInvoiceDetail using EF Core
            var results = await _dbContext.SalesInvoiceDetails
                .AsNoTracking()
                .Where(v => v.InvoiceNo == invoiceNo.Trim())
                .ToListAsync(cancellationToken);

            if (results.Any())
            {
                return results;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Live SQL Server query for view secuser.Vw_SalesInvoiceDetail encountered an issue. Falling back to pre-seeded JDE view data.");
        }

        // Fallback to pre-seeded view data for testing & staging execution
        var sampleRows = InvoiceSampleData.GetSampleInvoiceRows()
            .Where(r => string.Equals(r.InvoiceNo, invoiceNo.Trim(), StringComparison.OrdinalIgnoreCase))
            .ToList();

        return sampleRows;
    }

    public async Task<IEnumerable<string>> GetAvailableInvoiceNumbersAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var numbers = await _dbContext.SalesInvoiceDetails
                .AsNoTracking()
                .Select(v => v.InvoiceNo)
                .Distinct()
                .ToListAsync(cancellationToken);

            if (numbers.Any())
                return numbers;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not fetch invoice numbers from live SQL Server. Returning sample list.");
        }

        return InvoiceSampleData.GetSampleInvoiceRows()
            .Select(r => r.InvoiceNo)
            .Distinct();
    }
}
