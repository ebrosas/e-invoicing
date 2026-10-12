using EInvoicing.Domain.Entities;
using EInvoicing.Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;

namespace EInvoicing.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Keyless Entity representing the JDE database view secuser.Vw_SalesInvoiceDetail
    /// </summary>
    public DbSet<SalesInvoiceDetailView> SalesInvoiceDetails => Set<SalesInvoiceDetailView>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply entity configurations
        modelBuilder.ApplyConfiguration(new SalesInvoiceDetailViewConfiguration());
    }
}
