# GARMCO E-Invoicing: Oracle JD Edwards (JDE) ERP Professional Theme Redesign

This plan details the revision of the **Professional Theme** to authentically mirror the visual design, palette, component hierarchy, and layout of the **Oracle JD Edwards (JDE) EnterpriseOne ERP system**.

### User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction and specific JDE design decisions have been confirmed:

- **Confirmed Decision 1 (JDE Generation & Palette)**: The Professional theme will replicate the iconic **Classic JDE EnterpriseOne Blue & Gray** aesthetic—featuring the signature JDE deep enterprise blue top banner (`#003366` / `#0B3056`), secondary slate steel blue (`#1A5276`), enterprise beige/cool gray canvas (`#ECEFF4` / `#F0F3F7`), and soft cornflower blue grid headers (`#D9E5F2`).
- **Confirmed Decision 2 (Dedicated JDE Action Toolbar)**: Integration of a dedicated JDE EnterpriseOne interactive action toolbar ribbon above the form—featuring JDE's standard **Find** (Search), **Cancel / Clear** (Reset), **Form Exit: Process E-Invoice**, and **Row / Tools Exits** (View Payload, Fast Path, Staging Status).
- **Confirmed Decision 3 (High-Density Enterprise Grid)**: High-density tabular layout for Invoice Line Details with soft blue column headers (`#D9E5F2`), sharp 1px grid borders (`#B5C7D9`), row selection markers, and strict tabular numerals for weights and BHD currency figures.
- **Confirmed Decision 4 (Header/Detail Form Architecture)**: Restructuring the header fields into JDE EnterpriseOne group boxes with formal field label/data alignments (`P4210` / `P03B102` Header Detail style).

---

### 1. Overview & Core Concept

- **What It Does**: Transforms the Professional theme from the previous Toastmasters palette into an authentic **Oracle JD Edwards EnterpriseOne ERP** experience. Users working in JDE will experience seamless visual continuity—looking and behaving like a native JDE EnterpriseOne Interactive Application (e.g. `W4210A` / `W4205A` Sales Order / Invoice Inquiry & Confirmation).
- **Target Audience**: JDE ERP Operators, Billing Controllers, and Finance Officers in GARMCO Bahrain.
- **Key Value**: Unifies the external E-Invoicing portal with the internal JDE ERP look and feel, reducing cognitive load and training overhead.

---

### 2. User Experience & Visual Design

#### Color Tokens (Oracle JDE EnterpriseOne Professional Theme)

| Element | JDE ERP Token & Color | Function |
|---|---|---|
| **Top Banner / App Bar** | Deep Enterprise Blue (`#003366`) | Oracle JDE EnterpriseOne system banner with Oracle gold accent |
| **System Identity & Logo** | Oracle Gold (`#C89D2B`) & White | GARMCO JDE EnterpriseOne brand lockup |
| **Action Toolbar Ribbon** | Cool Steel Silver (`#E2E8F0` / `#DCE4EC`) | Houses Find, Reset, Process Invoice, and Exits |
| **Canvas Background** | JDE Enterprise Neutral (`#F0F3F7`) | Clean, non-distracting ERP application backdrop |
| **Group Boxes / Cards** | Crisp White (`#FFFFFF`) / JDE Border (`#B8C7D8`) | Structured group boxes with titled legend banners |
| **Grid Column Headers** | Soft Cornflower Blue (`#D9E5F2`) | Classic JDE grid header with dark text (`#0F2439`) |
| **Grid Row Alternate** | Subtle Cool Blue (`#F4F8FC`) | High-density zebra striping for rapid scanning |
| **Primary Actions** | JDE Deep Navy (`#003366`) / Gold Hover | Rounded action buttons with ambient shadows |
| **NBR Compliant Badge** | JDE Gold (`#B38600` on `#FFF8E1`) | Compliance accreditation chip |

#### Dedicated JDE EnterpriseOne Action Toolbar
- **Find (Search)**: Action button with search magnifying glass and keyboard Enter shortcut.
- **Cancel / Reset**: Action button with reset arrow, clearing fields and refocusing Invoice No.
- **Form Exit: Process Invoice**: Gold-accented action button triggering the 6-hour token authentication and Cygnet Save Document API.
- **Tools / Row Exits**: Quick links to "JDE Deep Links", "View JSON Payload", and "Cygnet Token Status".

---

### 3. Technical Architecture & File Updates

```
┌────────────────────────────────────────────────────────────────────────┐
│             Oracle JD Edwards EnterpriseOne Top Banner                 │
│         Deep Blue (#003366) • GARMCO E-Invoicing • Fast Path           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  JDE EnterpriseOne Action Toolbar                      │
│     [ Find ]  [ Clear ]  [ Form Exit: Process E-Invoice ]  [ Tools ]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  Group Box: Invoice Header Info  │  │   Group Box: Sold To Details     │
│  • Invoice No (with validation)  │  │   • Customer Name & No           │
│  • Invoice & DO Dates            │  │   • Address, Contact, Email      │
│  • Payment Terms & Net Due Date  │  │                                  │
└──────────────────────────────────┴──┴──────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│     JDE Line Details Data Grid (Soft Blue Headers #D9E5F2, Compact)    │
│  • Line No • Item Code • Description • MT • Price • Value • BHD Values │
└────────────────────────────────────────────────────────────────────────┘
```

1. **`src/index.css`**: Update `.theme-professional` tokens to Oracle JDE EnterpriseOne specifications (`#003366` header, `#D9E5F2` table header, `#F0F3F7` canvas, `#B8C7D8` borders).
2. **`src/App.tsx`**: Update layout to render the JDE EnterpriseOne Action Toolbar, JDE group boxes, and soft-blue table styling when the Professional theme is selected.
3. **`EInvoicing.Web/Shared/MainLayout.razor`**: Update `_professionalTheme` palette with Oracle JDE `#003366` primary, `#D9E5F2` lines/table header, and JDE action bar styling.
4. **Verification**: Run `compile_applet`, `lint_applet`, and verify zero errors.
