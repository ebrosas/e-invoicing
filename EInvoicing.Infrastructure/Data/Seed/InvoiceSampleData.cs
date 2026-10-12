using EInvoicing.Domain.Entities;

namespace EInvoicing.Infrastructure.Data.Seed;

public static class InvoiceSampleData
{
    public static List<SalesInvoiceDetailView> GetSampleInvoiceRows()
    {
        return new List<SalesInvoiceDetailView>
        {
            // Invoice 1: DOC-INV-04 (Matching the prompt's sample Cygnet payload)
            new SalesInvoiceDetailView
            {
                InvoiceNo = "DOC-INV-04",
                InvoiceDate = new DateTime(2026, 8, 26, 10, 10, 15),
                DeliveryOrderNo = "DO-2026-8801",
                DeliveryOrderDate = new DateTime(2026, 8, 25, 14, 30, 0),
                CustomerNo = "CUST-BH-9912",
                CustomerName = "Al-Maraj Industrial Technologies W.L.L",
                CustomerAddress = "Building 450, Road 2814, Block 328, Al Seef District, Manama, Kingdom of Bahrain",
                CustomerEmail = "accounts.payable@almaraj-tech.bh",
                CustomerContactNo = "+973 1758 8421",
                PaymentTerms = "Net 30 Days",
                NetDueDate = new DateTime(2026, 9, 25),
                LineNumber = 1,
                ItemCode = "STL-REBAR-16MM",
                ItemDescription = "High Yield Deformed Steel Rebar 16mm Grade 60 (BS 4449)",
                WeightMetricTons = 24.5000m,
                UnitPrice = 680.00m,
                Value = 16660.00m,
                UnitPriceBHD = 255.6800m, // Converted to Bahrain Dinar (USD to BHD ~ 0.376)
                ValueBHD = 6264.1600m,
                VatRate = 10.0m,
                VatAmountBHD = 626.4160m,
                VatCategoryCode = "S",
                SourceCurrency = "USD",
                ExchangeRate = 0.376m
            },
            new SalesInvoiceDetailView
            {
                InvoiceNo = "DOC-INV-04",
                InvoiceDate = new DateTime(2026, 8, 26, 10, 10, 15),
                DeliveryOrderNo = "DO-2026-8801",
                DeliveryOrderDate = new DateTime(2026, 8, 25, 14, 30, 0),
                CustomerNo = "CUST-BH-9912",
                CustomerName = "Al-Maraj Industrial Technologies W.L.L",
                CustomerAddress = "Building 450, Road 2814, Block 328, Al Seef District, Manama, Kingdom of Bahrain",
                CustomerEmail = "accounts.payable@almaraj-tech.bh",
                CustomerContactNo = "+973 1758 8421",
                PaymentTerms = "Net 30 Days",
                NetDueDate = new DateTime(2026, 9, 25),
                LineNumber = 2,
                ItemCode = "STL-BEAM-UB203",
                ItemDescription = "Universal Structural Steel Beam UB 203x133x30 S355JR",
                WeightMetricTons = 18.2500m,
                UnitPrice = 740.00m,
                Value = 13505.00m,
                UnitPriceBHD = 278.2400m,
                ValueBHD = 5077.8800m,
                VatRate = 10.0m,
                VatAmountBHD = 507.7880m,
                VatCategoryCode = "S",
                SourceCurrency = "USD",
                ExchangeRate = 0.376m
            },
            new SalesInvoiceDetailView
            {
                InvoiceNo = "DOC-INV-04",
                InvoiceDate = new DateTime(2026, 8, 26, 10, 10, 15),
                DeliveryOrderNo = "DO-2026-8801",
                DeliveryOrderDate = new DateTime(2026, 8, 25, 14, 30, 0),
                CustomerNo = "CUST-BH-9912",
                CustomerName = "Al-Maraj Industrial Technologies W.L.L",
                CustomerAddress = "Building 450, Road 2814, Block 328, Al Seef District, Manama, Kingdom of Bahrain",
                CustomerEmail = "accounts.payable@almaraj-tech.bh",
                CustomerContactNo = "+973 1758 8421",
                PaymentTerms = "Net 30 Days",
                NetDueDate = new DateTime(2026, 9, 25),
                LineNumber = 3,
                ItemCode = "ALU-COIL-08MM",
                ItemDescription = "Cold Rolled Aluminium Coil 0.8mm Alloy 3003-H14 Mill Finish",
                WeightMetricTons = 12.0000m,
                UnitPrice = 2450.00m,
                Value = 29400.00m,
                UnitPriceBHD = 921.2000m,
                ValueBHD = 11054.4000m,
                VatRate = 10.0m,
                VatAmountBHD = 1105.4400m,
                VatCategoryCode = "S",
                SourceCurrency = "USD",
                ExchangeRate = 0.376m
            },

            // Invoice 2: INV-2026-001
            new SalesInvoiceDetailView
            {
                InvoiceNo = "INV-2026-001",
                InvoiceDate = new DateTime(2026, 9, 12, 9, 15, 0),
                DeliveryOrderNo = "DO-9014",
                DeliveryOrderDate = new DateTime(2026, 9, 10, 11, 0, 0),
                CustomerNo = "CUST-1044",
                CustomerName = "Bahrain Petrochem Support Services",
                CustomerAddress = "Industrial Area North, Avenue 15, Sitra 601, Kingdom of Bahrain",
                CustomerEmail = "invoices@bhpetrochem.com",
                CustomerContactNo = "+973 1773 2099",
                PaymentTerms = "Net 60 Days",
                NetDueDate = new DateTime(2026, 11, 11),
                LineNumber = 1,
                ItemCode = "PIPE-CS-ASTM-A106",
                ItemDescription = "Seamless Carbon Steel Pipe 6 inch Sch 40 ASTM A106 Gr B",
                WeightMetricTons = 15.6000m,
                UnitPrice = 1150.00m,
                Value = 17940.00m,
                UnitPriceBHD = 432.4000m,
                ValueBHD = 6745.4400m,
                VatRate = 10.0m,
                VatAmountBHD = 674.5440m,
                VatCategoryCode = "S",
                SourceCurrency = "USD",
                ExchangeRate = 0.376m
            },
            new SalesInvoiceDetailView
            {
                InvoiceNo = "INV-2026-001",
                InvoiceDate = new DateTime(2026, 9, 12, 9, 15, 0),
                DeliveryOrderNo = "DO-9014",
                DeliveryOrderDate = new DateTime(2026, 9, 10, 11, 0, 0),
                CustomerNo = "CUST-1044",
                CustomerName = "Bahrain Petrochem Support Services",
                CustomerAddress = "Industrial Area North, Avenue 15, Sitra 601, Kingdom of Bahrain",
                CustomerEmail = "invoices@bhpetrochem.com",
                CustomerContactNo = "+973 1773 2099",
                PaymentTerms = "Net 60 Days",
                NetDueDate = new DateTime(2026, 11, 11),
                LineNumber = 2,
                ItemCode = "FLANGE-WN-CL300",
                ItemDescription = "Welding Neck Flange 6 inch Class 300 RF ASTM A105",
                WeightMetricTons = 4.2000m,
                UnitPrice = 1850.00m,
                Value = 7770.00m,
                UnitPriceBHD = 695.6000m,
                ValueBHD = 2921.5200m,
                VatRate = 10.0m,
                VatAmountBHD = 292.1520m,
                VatCategoryCode = "S",
                SourceCurrency = "USD",
                ExchangeRate = 0.376m
            },

            // Invoice 3: INV-JDE-8890
            new SalesInvoiceDetailView
            {
                InvoiceNo = "INV-JDE-8890",
                InvoiceDate = new DateTime(2026, 10, 1, 8, 45, 0),
                DeliveryOrderNo = "DO-JDE-332",
                DeliveryOrderDate = new DateTime(2026, 9, 29, 16, 20, 0),
                CustomerNo = "CUST-2098",
                CustomerName = "Gulf Infrastructure Contractors Co.",
                CustomerAddress = "Diplomatic Area, Tower 12, Floor 8, Manama, Kingdom of Bahrain",
                CustomerEmail = "billing@gulfinfra-bh.com",
                CustomerContactNo = "+973 1753 1100",
                PaymentTerms = "Immediate Upon Receipt",
                NetDueDate = new DateTime(2026, 10, 8),
                LineNumber = 1,
                ItemCode = "CEM-OPC-53",
                ItemDescription = "Ordinary Portland Cement Grade 53 Bulk Carrier Supply",
                WeightMetricTons = 50.0000m,
                UnitPrice = 92.50m,
                Value = 4625.00m,
                UnitPriceBHD = 34.7800m,
                ValueBHD = 1739.0000m,
                VatRate = 10.0m,
                VatAmountBHD = 173.9000m,
                VatCategoryCode = "S",
                SourceCurrency = "USD",
                ExchangeRate = 0.376m
            }
        };
    }
}
