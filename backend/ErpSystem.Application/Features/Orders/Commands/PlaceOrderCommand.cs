using MediatR;
using ErpSystem.Application.DTOs;

namespace ErpSystem.Application.Features.Orders.Commands;

public class PlaceOrderCommand : IRequest<OrderResponseDto>
{
    public string UserId { get; set; } = string.Empty;
    public List<CartItemDto> Items { get; set; } = new();
}
