using ErpSystem.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<User, Role, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<ShoppingCart> ShoppingCarts { get; set; } = null!;
    public DbSet<CartItem> CartItems { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;
    public DbSet<InventoryAuditLog> InventoryAuditLogs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Optimistic concurrency for PostgreSQL
        builder.Entity<Product>()
            .Property(p => p.Version)
            .IsRowVersion();

        // Indexes for performance
        builder.Entity<Product>()
            .HasIndex(p => p.SKU)
            .IsUnique();
            
        builder.Entity<Product>()
            .HasIndex(p => p.Name);

        builder.Entity<CartItem>()
            .HasOne(c => c.ShoppingCart)
            .WithMany(s => s.Items)
            .HasForeignKey(c => c.ShoppingCartId);
            
        builder.Entity<OrderItem>()
            .HasOne(o => o.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(o => o.OrderId);
    }
}
