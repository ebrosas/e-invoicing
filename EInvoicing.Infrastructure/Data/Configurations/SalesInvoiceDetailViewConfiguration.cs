using EInvoicing.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EInvoicing.Infrastructure.Data.Configurations;

public class SalesInvoiceDetailViewConfiguration : IEntityTypeConfiguration<SalesInvoiceDetailView>
{
    public void Configure(EntityTypeBuilder<SalesInvoiceDetailView> builder)
    {
        // Maps directly to the database view secuser.Vw_SalesInvoiceDetail
        builder.ToView("Vw_SalesInvoiceDetail", "secuser");
        builder.HasNoKey();

        builder.Property(e => e.InvoiceNo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.DeliveryOrderNo)
            .HasMaxLength(50);

        builder.Property(e => e.CustomerNo)
            .HasMaxLength(50);

        builder.Property(e => e.CustomerName)
            .HasMaxLength(200);

        builder.Property(e => e.CustomerAddress)
            .HasMaxLength(500);

        builder.Property(e => e.CustomerEmail)
            .HasMaxLength(150);

        builder.Property(e => e.CustomerContactNo)
            .HasMaxLength(50);

        builder.Property(e => e.PaymentTerms)
            .HasMaxLength(100);

        builder.Property(e => e.ItemCode)
            .HasMaxLength(50);

        builder.Property(e => e.ItemDescription)
            .HasMaxLength(250);

        builder.Property(e => e.WeightMetricTons)
            .HasPrecision(18, 4);

        builder.Property(e => e.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(e => e.Value)
            .HasPrecision(18, 4);

        builder.Property(e => e.UnitPriceBHD)
            .HasPrecision(18, 4);

        builder.Property(e => e.ValueBHD)
            .HasPrecision(18, 4);

        builder.Property(e => e.VatRate)
            .HasPrecision(5, 2);

        builder.Property(e => e.VatAmountBHD)
            .HasPrecision(18, 4);

        builder.Property(e => e.ExchangeRate)
            .HasPrecision(18, 6);
    }
}
