namespace ErpSystem.Domain.Entities;

public class InventoryAuditLog
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    public int ChangeAmount { get; set; }
    public string Type { get; set; } = string.Empty; // Restock, Sale
    public string ModifiedBy { get; set; } = string.Empty; // UserId
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
