using MediatR;
using ErpSystem.Application.DTOs;
using ErpSystem.Application.Interfaces;
using ErpSystem.Domain.Entities;
using ErpSystem.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ErpSystem.Application.Features.Orders.Commands;

public class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, OrderResponseDto>
{
    private readonly IRepository<ShoppingCart> _cartRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<Order> _orderRepository;
    private readonly IRepository<InventoryAuditLog> _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PlaceOrderCommandHandler> _logger;

    public PlaceOrderCommandHandler(
        IRepository<ShoppingCart> cartRepository,
        IRepository<Product> productRepository,
        IRepository<Order> orderRepository,
        IRepository<InventoryAuditLog> auditLogRepository,
        IUnitOfWork unitOfWork,
        ILogger<PlaceOrderCommandHandler> logger)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
        _orderRepository = orderRepository;
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<OrderResponseDto> Handle(PlaceOrderCommand request, CancellationToken cancellationToken)
    {
        if (request.Items == null || !request.Items.Any())
        {
            return new OrderResponseDto { Success = false, Message = "Shopping cart is empty." };
        }

        // Explicit Database Transaction Scope as required
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            decimal totalAmount = 0;
            var order = new Order
            {
                UserId = request.UserId,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                OrderItems = new List<OrderItem>()
            };

            // 2. Validate stock and create order items
            foreach (var cartItem in request.Items)
            {
                var product = await _productRepository.GetByIdAsync(cartItem.ProductId);
                if (product == null)
                {
                    throw new Exception($"Product with ID {cartItem.ProductId} not found.");
                }

                if (product.StockQuantity < cartItem.Quantity)
                {
                    throw new Exception($"Insufficient stock for product: {product.Name}");
                }

                // 3. Atomically decrement stock
                product.StockQuantity -= cartItem.Quantity;
                _productRepository.Update(product);

                // Create Order Item
                order.OrderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = cartItem.Quantity,
                    UnitPrice = product.UnitPrice
                });

                totalAmount += cartItem.Quantity * product.UnitPrice;

                // 4. Audit Log
                var auditLog = new InventoryAuditLog
                {
                    ProductId = product.Id,
                    ChangeAmount = -cartItem.Quantity,
                    Type = "Sale",
                    ModifiedBy = request.UserId,
                    Timestamp = DateTime.UtcNow
                };
                await _auditLogRepository.AddAsync(auditLog);
            }

            order.TotalAmount = totalAmount;
            
            // Save Order
            await _orderRepository.AddAsync(order);



            // 5. Commit Transaction
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return new OrderResponseDto 
            { 
                Success = true, 
                Message = "Order placed successfully.", 
                OrderId = order.Id 
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error placing order for user {UserId}. Rolling back transaction.", request.UserId);
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return new OrderResponseDto { Success = false, Message = ex.Message };
        }
    }
}
