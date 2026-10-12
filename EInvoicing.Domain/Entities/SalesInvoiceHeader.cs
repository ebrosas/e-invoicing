namespace EInvoicing.Domain.Entities;

public class SalesInvoiceHeader
{
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

    // Payment Terms & Due Date
    public string PaymentTerms { get; set; } = string.Empty;
    public DateTime NetDueDate { get; set; }

    // Currency & Totals
    public string CurrencyCode { get; set; } = "BHD";
    public decimal TotalLineNetAmountBHD { get; set; }
    public decimal TotalTaxAmountBHD { get; set; }
    public decimal TotalInvoiceAmountBHD { get; set; }

    // Navigation property for line details
    public List<SalesInvoiceLine> Lines { get; set; } = new();
}
