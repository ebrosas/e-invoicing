namespace EInvoicing.Domain.Enums;

public enum DocumentType
{
    INV, // Standard Tax Invoice
    CRN, // Credit Note
    DBN  // Debit Note
}

public enum SupplyType
{
    S, // Standard Supply
    Z, // Zero Rated
    E  // Exempted
}

public enum TransactionType
{
    NOR, // Normal
    EXP  // Export
}

public enum VatCategory
{
    StandardRated, // S - 10% or 5%
    ZeroRated,     // Z - 0%
    Exempt         // E - Exempt
}
