using FluentValidation;
using ErpSystem.Application.Features.Orders.Commands;

namespace ErpSystem.Application.Features.Orders.Validators;

public class PlaceOrderCommandValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderCommandValidator()
    {
        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("UserId is required.");
    }
}
