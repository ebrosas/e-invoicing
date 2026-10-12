namespace EInvoicing.Domain.Entities;

/// <summary>
/// Represents the exact database view structure of secuser.Vw_SalesInvoiceDetail in JDE ERP SQL Server.
/// </summary>
public class SalesInvoiceDetailView
{
    // Header Information
    public string InvoiceNo { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public string DeliveryOrderNo { get; set; } = string.Empty;
    public DateTime DeliveryOrderDate { get; set; }

    // Sold To Information
    public string CustomerNo { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerContactNo { get; set; } = string.Empty;

    // Payment Terms
    public string PaymentTerms { get; set; } = string.Empty;
    public DateTime NetDueDate { get; set; }

    // Line Details
    public int LineNumber { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string ItemDescription { get; set; } = string.Empty;
    public decimal WeightMetricTons { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Value { get; set; }
    public decimal UnitPriceBHD { get; set; }
    public decimal ValueBHD { get; set; }

    // Tax Details
    public decimal VatRate { get; set; } = 10.0m;
    public decimal VatAmountBHD { get; set; }
    public string VatCategoryCode { get; set; } = "S"; // S = Standard Rated

    // Currency Details
    public string SourceCurrency { get; set; } = "USD";
    public decimal ExchangeRate { get; set; } = 0.376m;
}
