namespace EInvoicing.Application.DTOs;

public class SalesInvoiceDto
{
    // Invoice Header
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

    // Currency & Summaries
    public string Currency { get; set; } = "BHD";
    public decimal TotalWeightMetricTons { get; set; }
    public decimal TotalLineNetAmountBHD { get; set; }
    public decimal TotalTaxAmountBHD { get; set; }
    public decimal TotalInvoiceAmountBHD { get; set; }

    // Multi-record line details grid
    public List<SalesInvoiceLineDto> Lines { get; set; } = new();
}

public class SalesInvoiceLineDto
{
    public int LineNumber { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string ItemDescription { get; set; } = string.Empty;
    public decimal WeightMetricTons { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Value { get; set; }
    public decimal UnitPriceBHD { get; set; }
    public decimal ValueBHD { get; set; }
    public decimal VatRate { get; set; } = 10.0m;
    public decimal VatAmountBHD { get; set; }
    public string VatCategoryCode { get; set; } = "S";
}
