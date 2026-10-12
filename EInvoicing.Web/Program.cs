using EInvoicing.Application.Interfaces;
using EInvoicing.Application.Services;
using EInvoicing.Domain.Interfaces;
using EInvoicing.Infrastructure.Data;
using EInvoicing.Infrastructure.Repositories;
using EInvoicing.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using MudBlazor.Services;

var builder = WebApplication.CreateBuilder(args);

// Add MudBlazor 8.8.0 services
builder.Services.AddMudServices();

// Add Razor Pages and Blazor Server
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

// Add EF Core SQL Server DbContext for secuser.Vw_SalesInvoiceDetail
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=.;Database=JDE_PRODUCTION;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// Add MemoryCache for 6-hour Cygnet token caching
builder.Services.AddMemoryCache();

// Add HttpClient for Cygnet Global E-Invoicing API
builder.Services.AddHttpClient<ICygnetEInvoicingService, CygnetEInvoicingService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Dependency Injection registrations
builder.Services.AddScoped<ISalesInvoiceRepository, SalesInvoiceRepository>();
builder.Services.AddScoped<ICygnetEInvoicingService, CygnetEInvoicingService>();
builder.Services.AddScoped<ISalesInvoiceService, SalesInvoiceService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

app.Run();
