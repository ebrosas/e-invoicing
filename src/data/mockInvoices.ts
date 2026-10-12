import { SalesInvoiceHeader } from '../types/invoicing';

export const JDE_SAMPLE_INVOICES: SalesInvoiceHeader[] = [
  {
    invoiceNo: 'DOC-INV-04',
    invoiceDate: '2026-08-26 10:10:15',
    deliveryOrderNo: 'DO-2026-8801',
    deliveryOrderDate: '2026-08-25 14:30:00',
    customerNo: 'CUST-BH-9912',
    customerName: 'Al-Maraj Industrial Technologies W.L.L',
    customerAddress: 'Building 450, Road 2814, Block 328, Al Seef District, Manama, Kingdom of Bahrain',
    customerEmail: 'accounts.payable@almaraj-tech.bh',
    customerContactNo: '+973 1758 8421',
    paymentTerms: 'Net 30 Days',
    netDueDate: '2026-09-25',
    currency: 'BHD',
    totalWeightMetricTons: 54.75,
    totalLineNetAmountBHD: 22396.44,
    totalTaxAmountBHD: 2239.644,
    totalInvoiceAmountBHD: 24636.084,
    lines: [
      {
        lineNumber: 1,
        itemCode: 'STL-REBAR-16MM',
        itemDescription: 'High Yield Deformed Steel Rebar 16mm Grade 60 (BS 4449)',
        weightMetricTons: 24.50,
        unitPrice: 680.00,
        value: 16660.00,
        unitPriceBHD: 255.6800,
        valueBHD: 6264.160,
        vatRate: 10,
        vatAmountBHD: 626.416,
        vatCategoryCode: 'S'
      },
      {
        lineNumber: 2,
        itemCode: 'STL-BEAM-UB203',
        itemDescription: 'Universal Structural Steel Beam UB 203x133x30 S355JR',
        weightMetricTons: 18.25,
        unitPrice: 740.00,
        value: 13505.00,
        unitPriceBHD: 278.2400,
        valueBHD: 5077.880,
        vatRate: 10,
        vatAmountBHD: 507.788,
        vatCategoryCode: 'S'
      },
      {
        lineNumber: 3,
        itemCode: 'ALU-COIL-08MM',
        itemDescription: 'Cold Rolled Aluminium Coil 0.8mm Alloy 3003-H14 Mill Finish',
        weightMetricTons: 12.00,
        unitPrice: 2450.00,
        value: 29400.00,
        unitPriceBHD: 921.2000,
        valueBHD: 11054.400,
        vatRate: 10,
        vatAmountBHD: 1105.440,
        vatCategoryCode: 'S'
      }
    ]
  },
  {
    invoiceNo: 'INV-2026-001',
    invoiceDate: '2026-09-12 09:15:00',
    deliveryOrderNo: 'DO-9014',
    deliveryOrderDate: '2026-09-10 11:00:00',
    customerNo: 'CUST-1044',
    customerName: 'Bahrain Petrochem Support Services',
    customerAddress: 'Industrial Area North, Avenue 15, Sitra 601, Kingdom of Bahrain',
    customerEmail: 'invoices@bhpetrochem.com',
    customerContactNo: '+973 1773 2099',
    paymentTerms: 'Net 60 Days',
    netDueDate: '2026-11-11',
    currency: 'BHD',
    totalWeightMetricTons: 19.80,
    totalLineNetAmountBHD: 9666.96,
    totalTaxAmountBHD: 966.696,
    totalInvoiceAmountBHD: 10633.656,
    lines: [
      {
        lineNumber: 1,
        itemCode: 'PIPE-CS-ASTM-A106',
        itemDescription: 'Seamless Carbon Steel Pipe 6 inch Sch 40 ASTM A106 Gr B',
        weightMetricTons: 15.60,
        unitPrice: 1150.00,
        value: 17940.00,
        unitPriceBHD: 432.4000,
        valueBHD: 6745.440,
        vatRate: 10,
        vatAmountBHD: 674.544,
        vatCategoryCode: 'S'
      },
      {
        lineNumber: 2,
        itemCode: 'FLANGE-WN-CL300',
        itemDescription: 'Welding Neck Flange 6 inch Class 300 RF ASTM A105',
        weightMetricTons: 4.20,
        unitPrice: 1850.00,
        value: 7770.00,
        unitPriceBHD: 695.6000,
        valueBHD: 2921.520,
        vatRate: 10,
        vatAmountBHD: 292.152,
        vatCategoryCode: 'S'
      }
    ]
  },
  {
    invoiceNo: 'INV-JDE-8890',
    invoiceDate: '2026-10-01 08:45:00',
    deliveryOrderNo: 'DO-JDE-332',
    deliveryOrderDate: '2026-09-29 16:20:00',
    customerNo: 'CUST-2098',
    customerName: 'Gulf Infrastructure Contractors Co.',
    customerAddress: 'Diplomatic Area, Tower 12, Floor 8, Manama, Kingdom of Bahrain',
    customerEmail: 'billing@gulfinfra-bh.com',
    customerContactNo: '+973 1753 1100',
    paymentTerms: 'Immediate Upon Receipt',
    netDueDate: '2026-10-08',
    currency: 'BHD',
    totalWeightMetricTons: 50.00,
    totalLineNetAmountBHD: 1739.00,
    totalTaxAmountBHD: 173.90,
    totalInvoiceAmountBHD: 1912.90,
    lines: [
      {
        lineNumber: 1,
        itemCode: 'CEM-OPC-53',
        itemDescription: 'Ordinary Portland Cement Grade 53 Bulk Carrier Supply',
        weightMetricTons: 50.00,
        unitPrice: 92.50,
        value: 4625.00,
        unitPriceBHD: 34.7800,
        valueBHD: 1739.000,
        vatRate: 10,
        vatAmountBHD: 173.90,
        vatCategoryCode: 'S'
      }
    ]
  }
];
