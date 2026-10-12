export interface SalesInvoiceLine {
  lineNumber: number;
  itemCode: string;
  itemDescription: string;
  weightMetricTons: number;
  unitPrice: number;
  value: number;
  unitPriceBHD: number;
  valueBHD: number;
  vatRate: number;
  vatAmountBHD: number;
  vatCategoryCode: string;
}

export interface SalesInvoiceHeader {
  invoiceNo: string;
  invoiceDate: string;
  deliveryOrderNo: string;
  deliveryOrderDate: string;
  customerNo: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerContactNo: string;
  paymentTerms: string;
  netDueDate: string;
  currency: string;
  totalWeightMetricTons: number;
  totalLineNetAmountBHD: number;
  totalTaxAmountBHD: number;
  totalInvoiceAmountBHD: number;
  lines: SalesInvoiceLine[];
}

export interface CygnetTokenInfo {
  token: string;
  expiryMinutes: number;
  issuedAt: string;
  expiresAt: string;
}

export interface ProcessInvoiceResult {
  success: boolean;
  invoiceNo: string;
  referenceId?: string;
  tokenUsed?: string;
  tokenFromCache?: boolean;
  processedAt: string;
  message: string;
  rawRequestPayload?: any;
  rawResponsePayload?: any;
  errors?: string[];
}
