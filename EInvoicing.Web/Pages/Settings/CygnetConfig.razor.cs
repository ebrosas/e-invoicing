using EInvoicing.Application.Interfaces;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Configuration;
using MudBlazor;

namespace EInvoicing.Web.Pages.Settings;

public partial class CygnetConfig : ComponentBase
{
    [Inject] private ICygnetEInvoicingService CygnetService { get; set; } = default!;
    [Inject] private IConfiguration Configuration { get; set; } = default!;
    [Inject] private ISnackbar Snackbar { get; set; } = default!;

    private bool _isSandbox = true;
    private string _authUrl = "https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/authenticate/token";
    private string _saveUrl = "https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/document/save";
    private string _clientId = "JDE_BH_CLIENT_001";
    private string _clientSecret = "CYGNET_SEC_889922A";
    private string _username = "jde_tax_specialist";
    private string _password = "Password123!";
    private string _callbackUrl = "https://jde-einvoicing.example.com/api/webhook/cygnet";

    protected override void OnInitialized()
    {
        _isSandbox = CygnetService.IsSandboxMode;
        _authUrl = Configuration["CygnetEInvoicing:AuthEndpoint"] ?? _authUrl;
        _saveUrl = Configuration["CygnetEInvoicing:SaveDocumentEndpoint"] ?? _saveUrl;
        _clientId = Configuration["CygnetEInvoicing:ClientId"] ?? _clientId;
        _clientSecret = Configuration["CygnetEInvoicing:ClientSecret"] ?? _clientSecret;
        _username = Configuration["CygnetEInvoicing:Username"] ?? _username;
        _password = Configuration["CygnetEInvoicing:Password"] ?? _password;
        _callbackUrl = Configuration["CygnetEInvoicing:CallbackUrl"] ?? _callbackUrl;
    }

    private void SaveConfig()
    {
        CygnetService.IsSandboxMode = _isSandbox;
        Snackbar.Add("Cygnet API configurations updated successfully.", Severity.Success);
    }
}
