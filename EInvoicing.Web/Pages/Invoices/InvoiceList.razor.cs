using EInvoicing.Application.DTOs;
using EInvoicing.Application.Interfaces;
using Microsoft.AspNetCore.Components;

namespace EInvoicing.Web.Pages.Invoices;

public partial class InvoiceList : ComponentBase
{
    [Inject] private ISalesInvoiceService SalesInvoiceService { get; set; } = default!;
    [Inject] private NavigationManager NavigationManager { get; set; } = default!;

    private List<SalesInvoiceDto> _invoices = new();
    private bool _isLoading = false;

    protected override async Task OnInitializedAsync()
    {
        await LoadInvoicesAsync();
    }

    private async Task LoadInvoicesAsync()
    {
        _isLoading = true;
        _invoices.Clear();

        var invoiceNumbers = await SalesInvoiceService.GetRecentInvoiceNumbersAsync();
        foreach (var no in invoiceNumbers)
        {
            var inv = await SalesInvoiceService.GetInvoiceByNumberAsync(no);
            if (inv != null)
            {
                _invoices.Add(inv);
            }
        }

        _isLoading = false;
        StateHasChanged();
    }

    private void OpenInvoice(string invoiceNo)
    {
        NavigationManager.NavigateTo($"/?invoiceNo={invoiceNo}");
    }
}
