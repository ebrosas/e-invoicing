namespace EInvoicing.Domain.Entities;

public class SalesInvoiceLine
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
