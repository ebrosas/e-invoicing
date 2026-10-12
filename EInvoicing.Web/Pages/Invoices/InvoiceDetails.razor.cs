using EInvoicing.Application.DTOs;
using EInvoicing.Application.Interfaces;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.WebUtilities;
using MudBlazor;

namespace EInvoicing.Web.Pages.Invoices;

public partial class InvoiceDetails : ComponentBase
{
    [Inject] private ISalesInvoiceService SalesInvoiceService { get; set; } = default!;
    [Inject] private ICygnetEInvoicingService CygnetService { get; set; } = default!;
    [Inject] private NavigationManager NavigationManager { get; set; } = default!;
    [Inject] private ISnackbar Snackbar { get; set; } = default!;

    [Parameter]
    [SupplyParameterFromQuery(Name = "invoiceNo")]
    public string? QueryInvoiceNo { get; set; }

    private MudTextField<string>? _invoiceNumberInput;
    private string _searchInvoiceNo = string.Empty;
    private SalesInvoiceDto? _invoice;
    private bool _isLoading = false;
    private bool _isProcessing = false;
    private ProcessInvoiceResultDto? _lastResult;
    private string _tokenStatusSummary = "Active (6-Hour Sliding Cache)";

    private readonly List<string> _sampleInvoices = new() { "DOC-INV-04", "INV-2026-001", "INV-JDE-8890" };

    protected override async Task OnInitializedAsync()
    {
        // Check for invoiceNo or InvoiceNo in URI query string
        var uri = NavigationManager.ToAbsoluteUri(NavigationManager.Uri);
        var queryParams = QueryHelpers.ParseQuery(uri.Query);

        string? invoiceParam = null;
        if (queryParams.TryGetValue("invoiceNo", out var val1))
        {
            invoiceParam = val1.ToString();
        }
        else if (queryParams.TryGetValue("InvoiceNo", out var val2))
        {
            invoiceParam = val2.ToString();
        }

        if (!string.IsNullOrWhiteSpace(invoiceParam))
        {
            _searchInvoiceNo = invoiceParam.Trim();
            await SearchInvoiceAsync();
        }
        else
        {
            // Default to DOC-INV-04 for instantaneous JDE preview
            _searchInvoiceNo = "DOC-INV-04";
            await SearchInvoiceAsync();
        }
    }

    /// <summary>
    /// Searches database view secuser.Vw_SalesInvoiceDetail for matching invoice number.
    /// </summary>
    private async Task SearchInvoiceAsync()
    {
        if (string.IsNullOrWhiteSpace(_searchInvoiceNo))
        {
            Snackbar.Add("Please enter an Invoice Number to search.", Severity.Warning);
            return;
        }

        _isLoading = true;
        _lastResult = null;
        StateHasChanged();

        try
        {
            _invoice = await SalesInvoiceService.GetInvoiceByNumberAsync(_searchInvoiceNo.Trim());

            if (_invoice == null)
            {
                Snackbar.Add($"Invoice '{_searchInvoiceNo}' was not found in JDE view secuser.Vw_SalesInvoiceDetail.", Severity.Error);
            }
            else
            {
                Snackbar.Add($"Loaded Invoice {_invoice.InvoiceNo} with {_invoice.Lines.Count} line items.", Severity.Success);
            }
        }
        catch (Exception ex)
        {
            Snackbar.Add($"Error querying database: {ex.Message}", Severity.Error);
        }
        finally
        {
            _isLoading = false;
            StateHasChanged();
        }
    }

    /// <summary>
    /// Clears the entire form and shifts keyboard focus directly back to the Invoice Number input.
    /// </summary>
    private async Task ResetFormAsync()
    {
        _searchInvoiceNo = string.Empty;
        _invoice = null;
        _lastResult = null;
        _isLoading = false;
        _isProcessing = false;

        StateHasChanged();

        // Refocus the Invoice Number input field as required by business specifications
        if (_invoiceNumberInput != null)
        {
            await _invoiceNumberInput.FocusAsync();
        }

        Snackbar.Add("Form cleared. Please enter a new Invoice Number.", Severity.Info);
    }

    /// <summary>
    /// Executes the Cygnet Global E-Invoicing APIs (Auth token with 6-hr cache + Save Documents).
    /// </summary>
    private async Task ProcessInvoiceAsync()
    {
        if (_invoice == null)
        {
            Snackbar.Add("No active invoice loaded to process.", Severity.Warning);
            return;
        }

        _isProcessing = true;
        StateHasChanged();

        try
        {
            var result = await SalesInvoiceService.ProcessInvoiceAsync(_invoice.InvoiceNo);
            _lastResult = result;

            if (result.Success)
            {
                Snackbar.Add($"E-Invoice successfully processed! Cygnet Reference ID: {result.ReferenceId}", Severity.Success);
            }
            else
            {
                Snackbar.Add($"Process failed: {result.Message}", Severity.Error);
            }
        }
        catch (Exception ex)
        {
            Snackbar.Add($"Fatal error processing invoice: {ex.Message}", Severity.Error);
        }
        finally
        {
            _isProcessing = false;
            StateHasChanged();
        }
    }

    private async Task LoadSampleInvoiceAsync(string sampleNumber)
    {
        _searchInvoiceNo = sampleNumber;
        await SearchInvoiceAsync();
    }

    private async Task HandleKeyDown(KeyboardEventArgs e)
    {
        if (e.Key == "Enter")
        {
            await SearchInvoiceAsync();
        }
    }
}
