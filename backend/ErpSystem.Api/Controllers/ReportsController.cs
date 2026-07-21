using ClosedXML.Excel;
using ErpSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace ErpSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("inventory/export")]
    public async Task<IActionResult> ExportInventory()
    {
        var products = await _context.Products.Include(p => p.Category).ToListAsync();

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Inventory Report");

        // Headers
        worksheet.Cell(1, 1).Value = "ID";
        worksheet.Cell(1, 2).Value = "Name";
        worksheet.Cell(1, 3).Value = "SKU";
        worksheet.Cell(1, 4).Value = "Category";
        worksheet.Cell(1, 5).Value = "Unit Price";
        worksheet.Cell(1, 6).Value = "Stock Quantity";

        // Data
        for (int i = 0; i < products.Count; i++)
        {
            var p = products[i];
            int row = i + 2;
            worksheet.Cell(row, 1).Value = p.Id;
            worksheet.Cell(row, 2).Value = p.Name;
            worksheet.Cell(row, 3).Value = p.SKU;
            worksheet.Cell(row, 4).Value = p.Category?.Name ?? "N/A";
            worksheet.Cell(row, 5).Value = p.UnitPrice;
            worksheet.Cell(row, 6).Value = p.StockQuantity;
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "InventoryReport.xlsx");
    }
}
