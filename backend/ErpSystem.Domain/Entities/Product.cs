using System.ComponentModel.DataAnnotations;

namespace ErpSystem.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsDeleted { get; set; }

    public uint Version { get; set; } // Optimistic Concurrency Token for PostgreSQL (xmin)

    public int CategoryId { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public Category? Category { get; set; }
}
