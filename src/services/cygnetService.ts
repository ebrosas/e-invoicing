import { SalesInvoiceHeader, CygnetTokenInfo, ProcessInvoiceResult } from '../types/invoicing';

class CygnetClient {
  private tokenInfo: CygnetTokenInfo | null = null;
  public isSandbox: boolean = true;
  public authEndpoint: string = 'https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/authenticate/token';
  public saveDocumentEndpoint: string = 'https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/document/save';
  public clientId: string = 'JDE_BH_CLIENT_001';
  public clientSecret: string = 'CYGNET_SEC_889922A';
  public username: string = 'jde_tax_specialist';
  public password: string = 'Password123!';
  public callbackUrl: string = 'https://jde-einvoicing.example.com/api/webhook/cygnet';

  constructor() {
    // Check localStorage for persisted token
    try {
      const stored = localStorage.getItem('cygnet_token_cache');
      if (stored) {
        const parsed: CygnetTokenInfo = JSON.parse(stored);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          this.tokenInfo = parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  public getActiveToken(): CygnetTokenInfo | null {
    if (!this.tokenInfo) return null;
    if (new Date(this.tokenInfo.expiresAt).getTime() <= Date.now()) {
      this.tokenInfo = null;
      return null;
    }
    return this.tokenInfo;
  }

  public async getAuthenticationToken(forceRefresh = false): Promise<{ token: string; fromCache: boolean }> {
    const active = this.getActiveToken();
    if (!forceRefresh && active) {
      // Check if within 10 minutes of expiry
      const diffMs = new Date(active.expiresAt).getTime() - Date.now();
      const tenMinutesMs = 10 * 60 * 1000;
      if (diffMs > tenMinutesMs) {
        return { token: active.token, fromCache: true };
      }
    }

    if (this.isSandbox) {
      // Simulate authentic 6-hour token
      const token = 'CYGNET-JWT-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      const now = new Date();
      const expires = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
      this.tokenInfo = {
        token,
        expiryMinutes: 360,
        issuedAt: now.toISOString(),
        expiresAt: expires.toISOString()
      };
      try {
        localStorage.setItem('cygnet_token_cache', JSON.stringify(this.tokenInfo));
      } catch {
        // ignore
      }
      return { token, fromCache: false };
    }

    // Live endpoint request
    try {
      const resp = await fetch(this.authEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-id': this.clientId,
          'client-secret': this.clientSecret
        },
        body: JSON.stringify({
          forceRefresh,
          username: this.username,
          password: this.password
        })
      });

      const data = await resp.json();
      if (!resp.ok || !data.token) {
        const errMsg = data?.errors?.[0]?.message || 'Authentication error from Cygnet Staging API';
        throw new Error(errMsg);
      }

      const now = new Date();
      const expiryMinutes = data.expiryTimeInMinutes || 360;
      const expires = new Date(now.getTime() + expiryMinutes * 60 * 1000);
      this.tokenInfo = {
        token: data.token,
        expiryMinutes,
        issuedAt: now.toISOString(),
        expiresAt: expires.toISOString()
      };
      localStorage.setItem('cygnet_token_cache', JSON.stringify(this.tokenInfo));
      return { token: data.token, fromCache: false };
    } catch (err: any) {
      throw new Error(`Failed to reach Cygnet Auth API: ${err.message}`);
    }
  }

  public createBahrainPayload(invoice: SalesInvoiceHeader) {
    return {
      data: [
        {
          country: 'BH',
          entityTaxRegNo: '200012345678574',
          entityName: 'Bahrain JDE Entity W.L.L',
          entityTin: '2000123456',
          returnPeriod: new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' }).replace('/', ''),
          purpose: 'EINV',
          autoPushOrGenerate: '',
          supplyType: 'S',
          transactionType: 'NOR',
          transactionTypeCode: '10000000',
          documentType: 'INV',
          documentUuid: '61483f74-7773-426a-bda4-' + Math.random().toString(16).substring(2, 14),
          documentTypePurpose: '380',
          documentSeriesCode: null,
          documentNumber: invoice.invoiceNo,
          documentDate: invoice.invoiceDate,
          documentNotes: `Originating from JDE ERP system for Delivery Order ${invoice.deliveryOrderNo}`,
          documentCurrency: 'BHD',
          exchangeRate: null,
          purchaseOrderNumber: 'PO-' + invoice.invoiceNo,
          salesOrderNumber: invoice.deliveryOrderNo,
          contractDocumentReference: 'Cont-' + invoice.invoiceNo,
          noteReason: 'VD',
          billFromTaxRegNo: '200012345678574',
          billFromLegalName: 'JDE Enterprise Bahrain W.L.L',
          billFromTradeName: 'JDE Bahrain Commercial',
          billFromEndpoint: '0235:july18',
          billFromStreetName: 'Road 3801, Building 145',
          billFromCity: 'Manama',
          billFromPostCode: '318',
          billFromCountrySubdivision: 'Capital',
          billFromCountry: 'BH',
          billToTaxRegNo: '100123456789103',
          billToLegalName: invoice.customerName,
          billToTradeName: invoice.customerName,
          billToEndpoint: '0235:18july',
          billToIdentifier: invoice.customerNo,
          billToStreetName: invoice.customerAddress,
          billToCity: 'Manama',
          billToPostCode: '10001',
          billToCountrySubdivision: 'Capital',
          billToCountry: 'BH',
          paymentDueDate: invoice.netDueDate,
          paymentTermDetails: [
            {
              id: 'TERM-01',
              note: invoice.paymentTerms,
              amount: invoice.totalInvoiceAmountBHD.toFixed(3),
              dueDate: invoice.netDueDate
            }
          ],
          deliveryDate: invoice.deliveryOrderDate,
          totalTaxAmountInAccCurrency: invoice.totalTaxAmountBHD.toFixed(3),
          totalDocAmountInAccCurrency: invoice.totalInvoiceAmountBHD.toFixed(3),
          totalLineNetAmount: invoice.totalLineNetAmountBHD.toFixed(3),
          invoiceTotalAmountWithoutTax: invoice.totalLineNetAmountBHD.toFixed(3),
          invoiceTotalTaxAmount: invoice.totalTaxAmountBHD.toFixed(3),
          totalDocumentAmount: invoice.totalInvoiceAmountBHD.toFixed(3),
          paymentAmountDue: invoice.totalInvoiceAmountBHD.toFixed(3),
          vatCategoryWiseTotal: [
            {
              vatCategoryTaxableAmount: invoice.totalLineNetAmountBHD.toFixed(3),
              vatCategoryTaxAmount: invoice.totalTaxAmountBHD.toFixed(3),
              vatCategoryCode: 'S',
              vatCategoryRate: '10',
              vatExemptionReason: null
            }
          ],
          items: invoice.lines.map((line) => ({
            serialNumber: line.lineNumber.toString(),
            name: line.itemCode,
            description: line.itemDescription,
            isService: 'N',
            taxCategoryCode: line.vatCategoryCode,
            taxRate: line.vatRate.toString(),
            invoicedQuantity: line.weightMetricTons.toFixed(4),
            invoicedQuantityUnitCode: 'TNE', // Metric Tons
            unitPrice: line.unitPriceBHD.toFixed(4),
            netUnitPrice: line.unitPriceBHD.toFixed(4),
            taxableAmount: line.valueBHD.toFixed(3),
            taxAmount: line.vatAmountBHD.toFixed(3),
            taxAmountInAccCurrency: line.vatAmountBHD.toFixed(3)
          }))
        }
      ]
    };
  }

  public async processInvoice(invoice: SalesInvoiceHeader): Promise<ProcessInvoiceResult> {
    try {
      // 1. Authenticate & Obtain Token (cached across 6 hours)
      const { token, fromCache } = await this.getAuthenticationToken(false);

      // 2. Build Document Save Payload
      const requestPayload = this.createBahrainPayload(invoice);

      if (this.isSandbox) {
        // Simulated response with authentic reference format
        await new Promise((res) => setTimeout(res, 800)); // Network delay simulation
        const referenceId = 'REF-CYG-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const responsePayload = { referenceId };

        return {
          success: true,
          invoiceNo: invoice.invoiceNo,
          referenceId,
          tokenUsed: token.substring(0, 16) + '...',
          tokenFromCache: fromCache,
          processedAt: new Date().toISOString(),
          message: `E-Invoice submitted and cleared with Cygnet Global E-Invoicing. Reference ID: ${referenceId}`,
          rawRequestPayload: requestPayload,
          rawResponsePayload: responsePayload
        };
      }

      // Live Documents API Call
      const response = await fetch(this.saveDocumentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
          'callback-url': this.callbackUrl
        },
        body: JSON.stringify(requestPayload)
      });

      const responseData = await response.json();
      if (!response.ok || !responseData.referenceId) {
        const errorText = responseData?.errors?.[0]?.message || 'Document validation failed at Cygnet endpoint';
        return {
          success: false,
          invoiceNo: invoice.invoiceNo,
          processedAt: new Date().toISOString(),
          message: errorText,
          rawRequestPayload: requestPayload,
          rawResponsePayload: responseData,
          errors: [errorText]
        };
      }

      return {
        success: true,
        invoiceNo: invoice.invoiceNo,
        referenceId: responseData.referenceId,
        tokenUsed: token.substring(0, 16) + '...',
        tokenFromCache: fromCache,
        processedAt: new Date().toISOString(),
        message: `E-Invoice accepted by Cygnet Global. Reference ID: ${responseData.referenceId}`,
        rawRequestPayload: requestPayload,
        rawResponsePayload: responseData
      };
    } catch (err: any) {
      return {
        success: false,
        invoiceNo: invoice.invoiceNo,
        processedAt: new Date().toISOString(),
        message: err.message || 'Error occurred while communicating with Cygnet API',
        errors: [err.message]
      };
    }
  }
}

export const cygnetService = new CygnetClient();
