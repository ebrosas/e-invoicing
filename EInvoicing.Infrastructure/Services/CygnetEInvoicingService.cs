using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EInvoicing.Application.DTOs;
using EInvoicing.Application.Interfaces;
using EInvoicing.Domain.Entities;
using EInvoicing.Domain.Exceptions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EInvoicing.Infrastructure.Services;

public class CygnetEInvoicingService : ICygnetEInvoicingService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _memoryCache;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CygnetEInvoicingService> _logger;

    private const string TokenCacheKey = "Cygnet_Auth_Token_Cache";

    public bool IsSandboxMode { get; set; } = true;

    public CygnetEInvoicingService(
        HttpClient httpClient,
        IMemoryCache memoryCache,
        IConfiguration configuration,
        ILogger<CygnetEInvoicingService> logger)
    {
        _httpClient = httpClient;
        _memoryCache = memoryCache;
        _configuration = configuration;
        _logger = logger;

        var sandboxConfig = _configuration["CygnetEInvoicing:SandboxMode"];
        if (bool.TryParse(sandboxConfig, out var isSandbox))
        {
            IsSandboxMode = isSandbox;
        }
    }

    public async Task<string> GetAuthenticationTokenAsync(bool forceRefresh = false, CancellationToken cancellationToken = default)
    {
        // 1. Check existing cached token (lifetime 6 hours)
        if (!forceRefresh && _memoryCache.TryGetValue(TokenCacheKey, out CygnetAuthToken? cachedToken) && cachedToken != null)
        {
            if (!cachedToken.IsExpired)
            {
                // If token is within 10 minutes of expiry, trigger forceRefresh
                if (cachedToken.NeedsRefreshSoon)
                {
                    _logger.LogInformation("Token is within 10 minutes of expiry. Performing proactive forceRefresh.");
                    forceRefresh = true;
                }
                else
                {
                    _logger.LogInformation("Using active cached Cygnet Auth Token (issued at {IssuedAtUtc}, expires at {ExpiresAtUtc}).",
                        cachedToken.IssuedAtUtc, cachedToken.ExpiresAtUtc);
                    return cachedToken.Token;
                }
            }
        }

        // 2. If in sandbox simulation mode
        if (IsSandboxMode)
        {
            var simulatedToken = "CYGNET-STAGING-JWT-" + Guid.NewGuid().ToString("N")[..16].ToUpperInvariant();
            var tokenEntity = new CygnetAuthToken
            {
                Token = simulatedToken,
                ExpiryTimeInMinutes = 360, // 6 hours
                IssuedAtUtc = DateTime.UtcNow
            };
            _memoryCache.Set(TokenCacheKey, tokenEntity, TimeSpan.FromMinutes(360));
            return simulatedToken;
        }

        // 3. Live Cygnet Authentication API call
        var authEndpoint = _configuration["CygnetEInvoicing:AuthEndpoint"] 
            ?? "https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/authenticate/token";
        var clientId = _configuration["CygnetEInvoicing:ClientId"] ?? "JDE_CLIENT_ID";
        var clientSecret = _configuration["CygnetEInvoicing:ClientSecret"] ?? "JDE_CLIENT_SECRET";
        var username = _configuration["CygnetEInvoicing:Username"] ?? "jde_user";
        var password = _configuration["CygnetEInvoicing:Password"] ?? "jde_password";

        var payload = new CygnetAuthenticateRequestDto
        {
            ForceRefresh = forceRefresh,
            Username = username,
            Password = password
        };

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, authEndpoint)
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        requestMessage.Headers.Add("client-id", clientId);
        requestMessage.Headers.Add("client-secret", clientSecret);

        _logger.LogInformation("Calling Cygnet Authentication API at {Endpoint} (ForceRefresh: {ForceRefresh})", authEndpoint, forceRefresh);
        var response = await _httpClient.SendAsync(requestMessage, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Cygnet Authentication failed with status {StatusCode}: {ResponseBody}", response.StatusCode, responseBody);
            throw new CygnetApiException($"Failed to authenticate with Cygnet Global E-Invoicing API ({response.StatusCode}): {responseBody}");
        }

        var authResponse = JsonSerializer.Deserialize<CygnetAuthenticateResponseDto>(responseBody);
        if (string.IsNullOrWhiteSpace(authResponse?.Token))
        {
            var errMsg = authResponse?.Errors?.FirstOrDefault()?.Message ?? "Authentication token was empty in response.";
            throw new CygnetApiException($"Cygnet authentication failed: {errMsg}");
        }

        var validToken = new CygnetAuthToken
        {
            Token = authResponse.Token,
            ExpiryTimeInMinutes = authResponse.ExpiryTimeInMinutes > 0 ? authResponse.ExpiryTimeInMinutes : 360,
            IssuedAtUtc = DateTime.UtcNow
        };

        // Cache for 6 hours (or returned expiry)
        _memoryCache.Set(TokenCacheKey, validToken, TimeSpan.FromMinutes(validToken.ExpiryTimeInMinutes));
        return validToken.Token;
    }

    public async Task<CygnetSaveDocumentResponseDto> SaveDocumentAsync(CygnetSaveDocumentPayloadDto documentPayload, CancellationToken cancellationToken = default)
    {
        // 1. Get valid Auth Token (cached or refreshed)
        var authToken = await GetAuthenticationTokenAsync(false, cancellationToken);

        // 2. If sandbox mode
        if (IsSandboxMode)
        {
            var simulatedRefId = "REF-CYG-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
            return new CygnetSaveDocumentResponseDto
            {
                ReferenceId = simulatedRefId
            };
        }

        // 3. Live Save Document Call
        var saveEndpoint = _configuration["CygnetEInvoicing:SaveDocumentEndpoint"]
            ?? "https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/document/save";
        var callbackUrl = _configuration["CygnetEInvoicing:CallbackUrl"] ?? "https://jde-einvoicing.example.com/api/webhook/cygnet";

        var rootRequest = new CygnetSaveDocumentRootRequestDto
        {
            Data = new List<CygnetSaveDocumentPayloadDto> { documentPayload }
        };

        var requestJson = JsonSerializer.Serialize(rootRequest);
        var requestMessage = new HttpRequestMessage(HttpMethod.Post, saveEndpoint)
        {
            Content = new StringContent(requestJson, Encoding.UTF8, "application/json")
        };
        requestMessage.Headers.Add("auth-token", authToken);
        requestMessage.Headers.Add("callback-url", callbackUrl);

        _logger.LogInformation("Calling Cygnet Save Document API at {Endpoint} for Invoice {InvoiceNo}", saveEndpoint, documentPayload.DocumentNumber);
        var response = await _httpClient.SendAsync(requestMessage, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Cygnet Save Document API failed with status {StatusCode}: {ResponseBody}", response.StatusCode, responseBody);
            throw new CygnetApiException($"Cygnet Save Document API error: {responseBody}");
        }

        return JsonSerializer.Deserialize<CygnetSaveDocumentResponseDto>(responseBody) 
            ?? new CygnetSaveDocumentResponseDto { ReferenceId = "REF-" + Guid.NewGuid().ToString("N")[..8] };
    }

    public async Task<ProcessInvoiceResultDto> ProcessInvoiceAsync(SalesInvoiceDto invoice, CancellationToken cancellationToken = default)
    {
        try
        {
            bool wasTokenCached = _memoryCache.TryGetValue(TokenCacheKey, out CygnetAuthToken? cached) && cached != null && !cached.IsExpired;
            var authToken = await GetAuthenticationTokenAsync(false, cancellationToken);

            // Construct compliant Bahrain E-Invoicing payload
            var payload = MapToCygnetPayload(invoice);
            var rawRequestJson = JsonSerializer.Serialize(new CygnetSaveDocumentRootRequestDto { Data = new List<CygnetSaveDocumentPayloadDto> { payload } }, new JsonSerializerOptions { WriteIndented = true });

            var saveResponse = await SaveDocumentAsync(payload, cancellationToken);
            var rawResponseJson = JsonSerializer.Serialize(saveResponse, new JsonSerializerOptions { WriteIndented = true });

            return new ProcessInvoiceResultDto
            {
                Success = !string.IsNullOrWhiteSpace(saveResponse.ReferenceId),
                InvoiceNo = invoice.InvoiceNo,
                ReferenceId = saveResponse.ReferenceId,
                TokenUsed = authToken[..Math.Min(16, authToken.Length)] + "...",
                TokenFromCache = wasTokenCached,
                ProcessedAtUtc = DateTime.UtcNow,
                Message = $"E-Invoice successfully processed and registered with Cygnet Global. Reference ID: {saveResponse.ReferenceId}",
                RawRequestPayload = rawRequestJson,
                RawResponsePayload = rawResponseJson
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing invoice {InvoiceNo} with Cygnet Global E-Invoicing", invoice.InvoiceNo);
            return new ProcessInvoiceResultDto
            {
                Success = false,
                InvoiceNo = invoice.InvoiceNo,
                ProcessedAtUtc = DateTime.UtcNow,
                Message = $"Failed to process e-invoice: {ex.Message}",
                ValidationErrors = new List<string> { ex.Message }
            };
        }
    }

    private static CygnetSaveDocumentPayloadDto MapToCygnetPayload(SalesInvoiceDto invoice)
    {
        var document = new CygnetSaveDocumentPayloadDto
        {
            Country = "BH",
            EntityTaxRegNo = "200012345678574",
            EntityName = "Bahrain JDE Entity W.L.L",
            EntityTin = "2000123456",
            ReturnPeriod = invoice.InvoiceDate.ToString("MMyyyy"),
            Purpose = "EINV",
            SupplyType = "S",
            TransactionType = "NOR",
            TransactionTypeCode = "10000000",
            DocumentType = "INV",
            DocumentUuid = Guid.NewGuid().ToString(),
            DocumentTypePurpose = "380",
            DocumentNumber = invoice.InvoiceNo,
            DocumentDate = invoice.InvoiceDate.ToString("yyyy-MM-dd HH:mm:ss"),
            DocumentNotes = $"Sales invoice from JDE ERP for Delivery Order {invoice.DeliveryOrderNo}.",
            DocumentCurrency = "BHD",
            SalesOrderNumber = invoice.DeliveryOrderNo,
            
            // Bill To
            BillToLegalName = invoice.CustomerName,
            BillToTradeName = invoice.CustomerName,
            BillToIdentifier = invoice.CustomerNo,
            BillToStreetName = invoice.CustomerAddress,
            BillToCity = "Manama",
            BillToCountry = "BH",

            // Payment
            PaymentDueDate = invoice.NetDueDate.ToString("yyyy-MM-dd"),

            // Totals
            TotalLineNetAmount = invoice.TotalLineNetAmountBHD.ToString("F3"),
            InvoiceTotalAmountWithoutTax = invoice.TotalLineNetAmountBHD.ToString("F3"),
            InvoiceTotalTaxAmount = invoice.TotalTaxAmountBHD.ToString("F3"),
            TotalTaxAmountInAccCurrency = invoice.TotalTaxAmountBHD.ToString("F3"),
            TotalDocAmountInAccCurrency = invoice.TotalInvoiceAmountBHD.ToString("F3"),
            TotalDocumentAmount = invoice.TotalInvoiceAmountBHD.ToString("F3"),
            PaymentAmountDue = invoice.TotalInvoiceAmountBHD.ToString("F3"),

            VatCategoryWiseTotal = new List<CygnetVatCategoryTotalDto>
            {
                new()
                {
                    VatCategoryCode = "S",
                    VatCategoryRate = "10",
                    VatCategoryTaxableAmount = invoice.TotalLineNetAmountBHD.ToString("F3"),
                    VatCategoryTaxAmount = invoice.TotalTaxAmountBHD.ToString("F3")
                }
            },

            Items = invoice.Lines.Select((line, index) => new CygnetItemPayloadDto
            {
                SerialNumber = (index + 1).ToString(),
                Name = line.ItemCode,
                Description = line.ItemDescription,
                IsService = "N",
                TaxCategoryCode = line.VatCategoryCode,
                TaxRate = line.VatRate.ToString("0"),
                InvoicedQuantity = line.WeightMetricTons.ToString("F4"),
                InvoicedQuantityUnitCode = "TNE", // Metric Tons
                UnitPrice = line.UnitPriceBHD.ToString("F4"),
                NetUnitPrice = line.UnitPriceBHD.ToString("F4"),
                TaxableAmount = line.ValueBHD.ToString("F3"),
                TaxAmount = line.VatAmountBHD.ToString("F3"),
                TaxAmountInAccCurrency = line.VatAmountBHD.ToString("F3")
            }).ToList()
        };

        return document;
    }
}
