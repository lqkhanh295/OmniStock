namespace ErpSystem.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;
    
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    
    public string Status { get; set; } = "Pending"; // Pending, Processing, Shipped, Cancelled
    
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
