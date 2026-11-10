# JDE ERP E-Invoicing System (Blazor Server & Clean Architecture)

An enterprise E-Invoicing system designed for JDE ERP integration, retrieving sales invoice headers and multi-line details from SQL Server view `secuser.Vw_SalesInvoiceDetail` and transmitting compliant Bahrain e-invoices to Cygnet Global E-Invoicing APIs with token caching, real-time payload generation, and reference tracking.

### User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction and configuration strategy have been confirmed as follows:

- **Confirmed Decision 1 (Data Source & Seeding)**: The application will include pre-seeded JDE sales invoice records reflecting the exact `secuser.Vw_SalesInvoiceDetail` schema for instant exploration and testing, backed by configurable SQL Server EF Core connection strings in `appsettings.json`.
- **Confirmed Decision 2 (Cygnet API & Sandbox Execution)**: An interactive toggle will allow seamless switching between live Cygnet staging endpoints (`https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one`) with user-provided credentials and a sandbox simulation mode returning authentic reference IDs and validation logs.
- **Confirmed Decision 3 (Hosting & Delivery)**: Dual delivery architecture:
  1. Complete, production-ready C# .NET 8 Clean Architecture solution structure (`EInvoicing.sln` comprising `EInvoicing.Domain`, `EInvoicing.Application`, `EInvoicing.Infrastructure`, and `EInvoicing.Web` with MudBlazor 8.8.0 components and `.razor.cs` code-behind).
  2. Full interactive web application running in AI Studio preview on port 3000 replicating the exact MudBlazor 8.8.0 component behavior, JDE query parameter handling (`?invoiceNo=...`), form reset, search, and Cygnet API transaction workflows.

---

### 1. Overview & Core Concept

- **What It Does**: Bridges JDE ERP with Cygnet Global E-Invoicing for the Kingdom of Bahrain. When an ERP operator clicks "Print Invoice" in JDE, the system accepts `?invoiceNo={InvoiceNo}`, queries `secuser.Vw_SalesInvoiceDetail`, populates the invoice header (Sold To, Customer No, Address, Contact, Payment Terms, Due Date) and a responsive multi-line grid with Metric Tons, Unit Price, Total Value, and BHD currency conversions. Users can search alternative invoices, reset the workspace with auto-focus, and execute "Process Invoice" which handles OAuth-like 6-hour token lifecycle management and document submission.
- **Target Audience / Persona**: Billing Specialists, ERP Controllers, Tax & Compliance Officers operating JDE ERP in Bahrain.
- **Key Value**: Eliminates manual invoice re-entry, guarantees valid BHD currency conversions and VAT calculations, complies with Bahrain National Bureau for Revenue (NBR) e-invoicing standards via Cygnet, and provides instant status feedback with trace reference IDs.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Direct JDE ERP Inbound Landing**: App loads with query string `?invoiceNo=DOC-INV-04`. It immediately queries the database view, populates the header cards and lines table, and displays a ready badge.
  2. **Search & Reset**:
     - *Reset*: Clears all header cards, lines, summary metrics, and validation logs, placing keyboard focus directly into the Invoice Number input field.
     - *Search*: User types an invoice number (or selects from an auto-complete list of JDE numbers) and clicks "Search" (or presses Enter) to retrieve live records.
  3. **Process Invoice Execution**:
     - User clicks "Process Invoice".
     - System executes Token Authentication (caching token for 6 hours; refreshes automatically if within 10 minutes of expiry).
     - System maps JDE header and line items into the Cygnet Bahrain E-Invoicing document format (`INV`, 380, BHD, Sold To/Bill To identifiers, VAT rate 5%/10%, total amounts, custom fields).
     - System calls Documents API `save` endpoint and displays the returned `referenceId`, submission timestamp, and full JSON audit payload.
- **Visual Identity & Theme**:
  - *Design System*: MudBlazor 8.8.0 enterprise palette with deep navy structural frame (`#0F172A`), crisp neutral surface (`#F8FAFC`), enterprise slate borders, and MudBlazor primary blue (`#2563EB`) and emerald status accents (`#059669`).
  - *Typography*: Clean corporate sans for UI hierarchy (`Plus Jakarta Sans`) paired with monospace tabular figures (`JetBrains Mono` / `tabular-nums`) for currency amounts, quantities, and reference numbers.
  - *Layout Density*: Enterprise high-density tabular view with MudBlazor `MudDataGrid` styling, compact header metric ribbons, and zero decorative fluff.
- **Interactive Feedback & States**:
  - Auto-focus on reset.
  - Progress circular indicators during API execution.
  - MudBlazor `MudAlert` and `MudSnackbar` notifications for success, validation errors, and token expiration countdowns.
  - Raw JSON audit viewer dialog to inspect Cygnet request/response payloads.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Clean Architecture Solution Partitioning**
  - *Approach*: Strict separation across four C# projects: `EInvoicing.Domain` (pure C# entities, enums, exceptions), `EInvoicing.Application` (CQRS-style commands, queries, DTOs, interfaces), `EInvoicing.Infrastructure` (EF Core `DbContext`, SQL Server mapping, Cygnet HttpClient, MemoryCache), and `EInvoicing.Web` (Blazor Server, MudBlazor 8.8.0, Razor code-behind).
  - *Why*: Ensures enterprise maintainability, testability, and adherence to Microsoft Clean Architecture best practices.
- **Decision 2: 6-Hour Cygnet Token Caching Strategy**
  - *Approach*: Store the retrieved Cygnet JWT token with an expiration timestamp (`6 hours = 360 minutes`). Pre-emptively trigger `forceRefresh: true` if execution occurs within 10 minutes of expiration.
  - *Why*: Avoids excessive authentication calls on every invoice submission while adhering to Cygnet's API rate limits and security guidelines.
- **Decision 3: Dual Hosting & Instant Interactivity**
  - *Approach*: Provide full, syntactically verified C# project code files for Visual Studio / `dotnet build` alongside an interactive preview server running on port 3000 so the user can immediately test the exact MudBlazor UI, search, reset, and Cygnet API workflows in AI Studio.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        JDE ERP (Client Browser)                        │
│                 URL: https://app/?invoiceNo=DOC-INV-04                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    EInvoicing.Web (Blazor Server)                      │
│  ┌───────────────────────┐  ┌──────────────────────────────────────┐   │
│  │ InvoiceDetails.razor   │  │ InvoiceDetails.razor.cs (Code-Behind)│   │
│  │ (MudBlazor 8.8.0 UI)  │  │ - SearchHandler, ResetHandler        │   │
│  │ - Header Cards        │  │ - ProcessInvoiceHandler              │   │
│  │ - Lines MudDataGrid   │  │ - NavigationManager / QueryString    │   │
│  └───────────────────────┘  └──────────────────┬───────────────────┘   │
└────────────────────────────────────────────────┼───────────────────────┘
                                                 │
                                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   EInvoicing.Application (Use Cases)                   │
│  • GetInvoiceByNumberQuery    • ProcessInvoiceCommand                  │
│  • ISalesInvoiceRepository     • ICygnetEInvoicingService              │
│  • SalesInvoiceDto & Mappers  • CygnetDocumentSaveRequestDto           │
└───────────────────────┬────────────────────────────────┬───────────────┘
                        │                                │
                        ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       EInvoicing.Infrastructure      │  │   Cygnet Global E-Invoicing  │
│  • AppDbContext (EF Core SQL Server) │  │   Staging REST Endpoints     │
│  • View: Vw_SalesInvoiceDetail       │  │   1. /authenticate/token     │
│  • Repository Implementation         │  │   2. /document/save          │
│  • TokenCache (6-hour sliding)       │  │                              │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

#### Database View Schema (`secuser.Vw_SalesInvoiceDetail`)
The entity maps the following database columns:
- `InvoiceNo` (nvarchar), `InvoiceDate` (datetime2)
- `DeliveryOrderNo` (nvarchar), `DeliveryOrderDate` (datetime2)
- `CustomerNo` (nvarchar), `CustomerName` (nvarchar)
- `CustomerAddress` (nvarchar), `CustomerEmail` (nvarchar), `CustomerContactNo` (nvarchar)
- `PaymentTerms` (nvarchar), `NetDueDate` (datetime2)
- Line items: `LineNumber` (int), `ItemCode` (nvarchar), `ItemDescription` (nvarchar), `WeightMetricTons` (decimal), `UnitPrice` (decimal), `Value` (decimal), `UnitPriceBHD` (decimal), `ValueBHD` (decimal)

#### Cygnet API Integration
- **Authentication**: `POST /enriched/v0.1/authenticate/token` with headers `client-id`, `client-secret` and body `{ forceRefresh, username, password }`. Caches token for 6 hours.
- **Document Save**: `POST /enriched/v0.1/document/save` with headers `auth-token`, `callback-url` and the Bahrain e-Invoice payload (`Country="BH"`, `DocumentType="INV"`, `DocumentTypePurpose="380"`, line items, VAT categorization, currency BHD).
