namespace ErpSystem.Domain.Entities;

public class ShoppingCart
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;
    
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
