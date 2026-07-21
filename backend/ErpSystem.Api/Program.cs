using ErpSystem.Application;
using ErpSystem.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Clean Architecture Layers
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    jwtKey = "SuperSecretKeyForDevelopmentOnly1234567890!";
    builder.Configuration["Jwt:Key"] = jwtKey;
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "http://localhost:5000",
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "http://localhost:5000",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ErpSystem.Infrastructure.Data.ApplicationDbContext>();
    await context.Database.EnsureCreatedAsync();

    var roleManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.RoleManager<ErpSystem.Domain.Entities.Role>>();
    var userManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<ErpSystem.Domain.Entities.User>>();

    if (!await roleManager.RoleExistsAsync("Admin"))
    {
        await roleManager.CreateAsync(new ErpSystem.Domain.Entities.Role { Name = "Admin" });
    }
    if (!await roleManager.RoleExistsAsync("Customer"))
    {
        await roleManager.CreateAsync(new ErpSystem.Domain.Entities.Role { Name = "Customer" });
    }

    var existingAdmin = await userManager.FindByEmailAsync("admin@example.com");
    if (existingAdmin == null)
    {
        var admin = new ErpSystem.Domain.Entities.User { UserName = "admin@example.com", Email = "admin@example.com", FirstName = "Admin", LastName = "User", Id = "admin-1" };
        await userManager.CreateAsync(admin, "Admin@123");
        await userManager.AddToRoleAsync(admin, "Admin");
    }
    else
    {
        var hasPassword = await userManager.HasPasswordAsync(existingAdmin);
        if (hasPassword) {
            await userManager.RemovePasswordAsync(existingAdmin);
        }
        await userManager.AddPasswordAsync(existingAdmin, "Admin@123");

        if (!await userManager.IsInRoleAsync(existingAdmin, "Admin"))
        {
            await userManager.AddToRoleAsync(existingAdmin, "Admin");
        }
    }

    var existingCustomer = await userManager.FindByIdAsync("user-123");
    if (existingCustomer == null)
    {
        var customer = new ErpSystem.Domain.Entities.User { UserName = "customer@example.com", Email = "customer@example.com", FirstName = "Customer", LastName = "User", Id = "user-123" };
        await userManager.CreateAsync(customer, "Customer@123");
        await userManager.AddToRoleAsync(customer, "Customer");
    }
    else
    {
        // Update the dummy user to be a real customer account
        existingCustomer.Email = "customer@example.com";
        existingCustomer.UserName = "customer@example.com";
        existingCustomer.FirstName = "Customer";
        existingCustomer.LastName = "User";
        await userManager.UpdateAsync(existingCustomer);
        
        var hasPassword = await userManager.HasPasswordAsync(existingCustomer);
        if (hasPassword) {
            await userManager.RemovePasswordAsync(existingCustomer);
        }
        await userManager.AddPasswordAsync(existingCustomer, "Customer@123");

        if (!await userManager.IsInRoleAsync(existingCustomer, "Customer"))
        {
            await userManager.AddToRoleAsync(existingCustomer, "Customer");
        }
    }

    if (!context.Categories.Any())
    {
        var category = new ErpSystem.Domain.Entities.Category { Name = "Networking", Description = "Networking Equipment" };
        context.Categories.Add(category);
        context.Products.AddRange(
            new ErpSystem.Domain.Entities.Product { Name = "Enterprise Server Rack", SKU = "SR-001", Description = "42U Server Rack for data centers", UnitPrice = 1200.00m, StockQuantity = 10, Category = category },
            new ErpSystem.Domain.Entities.Product { Name = "Cisco Catalyst Switch", SKU = "CS-002", Description = "48-port Gigabit Enterprise Switch", UnitPrice = 850.50m, StockQuantity = 5, Category = category },
            new ErpSystem.Domain.Entities.Product { Name = "Cat6 Ethernet Cable Box", SKU = "C6-003", Description = "1000ft Cat6 Cable spool", UnitPrice = 150.00m, StockQuantity = 50, Category = category }
        );
        await context.SaveChangesAsync();
    }
}

app.Run();
