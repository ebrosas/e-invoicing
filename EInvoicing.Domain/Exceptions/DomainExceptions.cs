namespace EInvoicing.Domain.Exceptions;

public class InvoiceNotFoundException : Exception
{
    public string InvoiceNo { get; }

    public InvoiceNotFoundException(string invoiceNo) 
        : base($"Sales Invoice '{invoiceNo}' was not found in JDE ERP database view secuser.Vw_SalesInvoiceDetail.")
    {
        InvoiceNo = invoiceNo;
    }
}

public class CygnetApiException : Exception
{
    public string? RequestId { get; }
    public string? ErrorCode { get; }

    public CygnetApiException(string message, string? errorCode = null, string? requestId = null) 
        : base(message)
    {
        ErrorCode = errorCode;
        RequestId = requestId;
    }
}
