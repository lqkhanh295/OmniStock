using ErpSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class InventoryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InventoryController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int threshold = 10)
    {
        var lowStockItems = await _context.Products
            .Where(p => p.StockQuantity < threshold)
            .ToListAsync();

        return Ok(lowStockItems);
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs()
    {
        var logs = await _context.InventoryAuditLogs
            .Include(l => l.Product)
            .OrderByDescending(l => l.Timestamp)
            .Take(100)
            .ToListAsync();
            
        return Ok(logs);
    }
}
