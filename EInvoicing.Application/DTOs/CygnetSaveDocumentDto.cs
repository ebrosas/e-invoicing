using System.Text.Json.Serialization;

namespace EInvoicing.Application.DTOs;

public class CygnetSaveDocumentRootRequestDto
{
    [JsonPropertyName("data")]
    public List<CygnetSaveDocumentPayloadDto> Data { get; set; } = new();
}

public class CygnetSaveDocumentPayloadDto
{
    [JsonPropertyName("country")]
    public string Country { get; set; } = "BH";

    [JsonPropertyName("entityTaxRegNo")]
    public string EntityTaxRegNo { get; set; } = "200012345678574";

    [JsonPropertyName("entityName")]
    public string EntityName { get; set; } = "Bahrain Entity W.L.L";

    [JsonPropertyName("entityTin")]
    public string EntityTin { get; set; } = "2000123456";

    [JsonPropertyName("returnPeriod")]
    public string ReturnPeriod { get; set; } = DateTime.UtcNow.ToString("MMyyyy");

    [JsonPropertyName("purpose")]
    public string Purpose { get; set; } = "EINV";

    [JsonPropertyName("autoPushOrGenerate")]
    public string AutoPushOrGenerate { get; set; } = "";

    [JsonPropertyName("supplyType")]
    public string SupplyType { get; set; } = "S";

    [JsonPropertyName("transactionType")]
    public string TransactionType { get; set; } = "NOR";

    [JsonPropertyName("transactionTypeCode")]
    public string TransactionTypeCode { get; set; } = "10000000";

    [JsonPropertyName("documentType")]
    public string DocumentType { get; set; } = "INV";

    [JsonPropertyName("documentUuid")]
    public string DocumentUuid { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("documentTypePurpose")]
    public string DocumentTypePurpose { get; set; } = "380";

    [JsonPropertyName("documentSeriesCode")]
    public string? DocumentSeriesCode { get; set; }

    [JsonPropertyName("documentNumber")]
    public string DocumentNumber { get; set; } = string.Empty;

    [JsonPropertyName("documentDate")]
    public string DocumentDate { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

    [JsonPropertyName("documentNotes")]
    public string DocumentNotes { get; set; } = "Generated from JDE ERP system for Bahrain E-Invoicing.";

    [JsonPropertyName("documentCurrency")]
    public string DocumentCurrency { get; set; } = "BHD";

    [JsonPropertyName("exchangeRate")]
    public string? ExchangeRate { get; set; }

    [JsonPropertyName("documentPeriodStartDate")]
    public string? DocumentPeriodStartDate { get; set; }

    [JsonPropertyName("documentPeriodEndDate")]
    public string? DocumentPeriodEndDate { get; set; }

    [JsonPropertyName("purchaseOrderNumber")]
    public string? PurchaseOrderNumber { get; set; }

    [JsonPropertyName("salesOrderNumber")]
    public string? SalesOrderNumber { get; set; }

    [JsonPropertyName("contractDocumentReference")]
    public string? ContractDocumentReference { get; set; }

    [JsonPropertyName("noteReason")]
    public string NoteReason { get; set; } = "VD";

    // Bill From (Supplier) Details
    [JsonPropertyName("billFromTaxRegNo")]
    public string BillFromTaxRegNo { get; set; } = "200012345678574";

    [JsonPropertyName("billFromLegalName")]
    public string BillFromLegalName { get; set; } = "JDE Enterprise Bahrain W.L.L";

    [JsonPropertyName("billFromTradeName")]
    public string BillFromTradeName { get; set; } = "JDE Bahrain Commercial";

    [JsonPropertyName("billFromEndpoint")]
    public string BillFromEndpoint { get; set; } = "0235:july18";

    [JsonPropertyName("billFromStreetName")]
    public string BillFromStreetName { get; set; } = "Road 3801, Building 145";

    [JsonPropertyName("billFromCity")]
    public string BillFromCity { get; set; } = "Manama";

    [JsonPropertyName("billFromPostCode")]
    public string BillFromPostCode { get; set; } = "318";

    [JsonPropertyName("billFromCountrySubdivision")]
    public string BillFromCountrySubdivision { get; set; } = "Capital";

    [JsonPropertyName("billFromCountry")]
    public string BillFromCountry { get; set; } = "BH";

    // Bill To (Buyer / Sold To) Details
    [JsonPropertyName("billToTaxRegNo")]
    public string BillToTaxRegNo { get; set; } = "100123456789103";

    [JsonPropertyName("billToLegalName")]
    public string BillToLegalName { get; set; } = string.Empty;

    [JsonPropertyName("billToTradeName")]
    public string BillToTradeName { get; set; } = string.Empty;

    [JsonPropertyName("billToEndpoint")]
    public string BillToEndpoint { get; set; } = "0235:18july";

    [JsonPropertyName("billToIdentifier")]
    public string BillToIdentifier { get; set; } = string.Empty;

    [JsonPropertyName("billToStreetName")]
    public string BillToStreetName { get; set; } = string.Empty;

    [JsonPropertyName("billToCity")]
    public string BillToCity { get; set; } = "Manama";

    [JsonPropertyName("billToPostCode")]
    public string BillToPostCode { get; set; } = "10001";

    [JsonPropertyName("billToCountrySubdivision")]
    public string BillToCountrySubdivision { get; set; } = "Capital";

    [JsonPropertyName("billToCountry")]
    public string BillToCountry { get; set; } = "BH";

    // Payment & Delivery
    [JsonPropertyName("paymentDueDate")]
    public string PaymentDueDate { get; set; } = string.Empty;

    [JsonPropertyName("deliveryDate")]
    public string? DeliveryDate { get; set; }

    [JsonPropertyName("totalTaxAmountInAccCurrency")]
    public string TotalTaxAmountInAccCurrency { get; set; } = "0";

    [JsonPropertyName("totalDocAmountInAccCurrency")]
    public string TotalDocAmountInAccCurrency { get; set; } = "0";

    [JsonPropertyName("totalLineNetAmount")]
    public string TotalLineNetAmount { get; set; } = "0";

    [JsonPropertyName("invoiceTotalAmountWithoutTax")]
    public string InvoiceTotalAmountWithoutTax { get; set; } = "0";

    [JsonPropertyName("invoiceTotalTaxAmount")]
    public string InvoiceTotalTaxAmount { get; set; } = "0";

    [JsonPropertyName("totalDocumentAmount")]
    public string TotalDocumentAmount { get; set; } = "0";

    [JsonPropertyName("paymentAmountDue")]
    public string PaymentAmountDue { get; set; } = "0";

    [JsonPropertyName("vatCategoryWiseTotal")]
    public List<CygnetVatCategoryTotalDto> VatCategoryWiseTotal { get; set; } = new();

    [JsonPropertyName("items")]
    public List<CygnetItemPayloadDto> Items { get; set; } = new();
}

public class CygnetVatCategoryTotalDto
{
    [JsonPropertyName("vatCategoryTaxableAmount")]
    public string VatCategoryTaxableAmount { get; set; } = "0";

    [JsonPropertyName("vatCategoryTaxAmount")]
    public string VatCategoryTaxAmount { get; set; } = "0";

    [JsonPropertyName("vatCategoryCode")]
    public string VatCategoryCode { get; set; } = "S";

    [JsonPropertyName("vatCategoryRate")]
    public string VatCategoryRate { get; set; } = "10";
}

public class CygnetItemPayloadDto
{
    [JsonPropertyName("serialNumber")]
    public string SerialNumber { get; set; } = "1";

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("isService")]
    public string IsService { get; set; } = "N";

    [JsonPropertyName("taxCategoryCode")]
    public string TaxCategoryCode { get; set; } = "S";

    [JsonPropertyName("taxRate")]
    public string TaxRate { get; set; } = "10";

    [JsonPropertyName("invoicedQuantity")]
    public string InvoicedQuantity { get; set; } = "1";

    [JsonPropertyName("invoicedQuantityUnitCode")]
    public string InvoicedQuantityUnitCode { get; set; } = "TNE"; // Metric Tons (UN/ECE Rec 20: TNE)

    [JsonPropertyName("unitPrice")]
    public string UnitPrice { get; set; } = "0";

    [JsonPropertyName("netUnitPrice")]
    public string NetUnitPrice { get; set; } = "0";

    [JsonPropertyName("taxableAmount")]
    public string TaxableAmount { get; set; } = "0";

    [JsonPropertyName("taxAmount")]
    public string TaxAmount { get; set; } = "0";

    [JsonPropertyName("taxAmountInAccCurrency")]
    public string TaxAmountInAccCurrency { get; set; } = "0";
}

public class CygnetSaveDocumentResponseDto
{
    [JsonPropertyName("referenceId")]
    public string? ReferenceId { get; set; }

    [JsonPropertyName("requestId")]
    public string? RequestId { get; set; }

    [JsonPropertyName("errors")]
    public List<CygnetApiErrorDto>? Errors { get; set; }
}
