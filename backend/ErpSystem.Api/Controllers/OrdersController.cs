using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ErpSystem.Application.Features.Orders.Commands;
using ErpSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using ErpSystem.Domain.Entities;

namespace ErpSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ApplicationDbContext _context;

    public OrdersController(IMediator mediator, ApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderCommand command)
    {
        command.UserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        
        var result = await _mediator.Send(command);
        
        if (!result.Success)
        {
            return BadRequest(new { result.Message });
        }

        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
            
        return Ok(orders);
    }

    [HttpGet("my-orders")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
            
        return Ok(orders);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound("Order not found");
        
        order.Status = request.Status;
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null) return NotFound("Order not found");
        if (order.Status != "Pending") return BadRequest(new { Message = "Only pending orders can be cancelled." });

        order.Status = "Cancelled";

        // Restore stock
        foreach (var item in order.OrderItems)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product != null)
            {
                product.StockQuantity += item.Quantity;
                _context.InventoryAuditLogs.Add(new InventoryAuditLog 
                { 
                    ProductId = product.Id, 
                    ChangeAmount = item.Quantity, 
                    Timestamp = DateTime.UtcNow,
                    Type = "Order Cancelled Restock",
                    ModifiedBy = User.Identity?.Name ?? "Customer"
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Order cancelled successfully." });
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
