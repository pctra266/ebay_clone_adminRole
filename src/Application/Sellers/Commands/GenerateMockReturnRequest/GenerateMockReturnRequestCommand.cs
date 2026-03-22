using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Sellers.Commands.GenerateMockReturnRequest;

public record GenerateMockReturnRequestCommand : IRequest<bool>
{
    public int SellerId { get; init; }
    public string Reason { get; init; } = "Item defective - screen won't turn on";
}

public class GenerateMockReturnRequestCommandHandler : IRequestHandler<GenerateMockReturnRequestCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public GenerateMockReturnRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(GenerateMockReturnRequestCommand request, CancellationToken cancellationToken)
    {
        // 1. Find Seller
        var seller = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.SellerId && (u.Role == "Seller" || _context.Stores.Any(s => s.SellerId == u.Id)), cancellationToken);

        if (seller == null)
            throw new ArgumentException($"Seller with ID '{request.SellerId}' not found.");

        // 2. Find Buyer
        var buyer = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Buyer", cancellationToken);
        if (buyer == null)
        {
            buyer = await _context.Users.FirstOrDefaultAsync(cancellationToken);
        }

        // 3. Find or Create Dummy Product
        var product = await _context.Products.FirstOrDefaultAsync(p => p.SellerId == seller.Id, cancellationToken);
        if (product == null)
        {
            product = new Product
            {
                Title = "Dummy Product for Return Request " + seller.Username,
                Description = "Mocking product",
                Price = 500000,
                CategoryId = 1,
                SellerId = seller.Id,
                Status = "Active"
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var orderDate = DateTime.UtcNow.AddDays(-5);
        var completedAt = DateTime.UtcNow.AddDays(-1);

        // 4. Create Order
        var order = new OrderTable
        {
            BuyerId = buyer!.Id,
            OrderDate = orderDate,
            TotalPrice = 500000,
            Status = "Delivered",
            CompletedAt = completedAt,
            EstimatedSettlementDate = completedAt.AddDays(21),
            CanDisputeUntil = completedAt.AddDays(14),
            PlatformFee = 25000,
            SellerEarnings = 475000
        };

        _context.OrderTables.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        // Add OrderItem
        _context.OrderItems.Add(new OrderItem
        {
            OrderId = order.Id,
            ProductId = product.Id,
            Quantity = 1,
            UnitPrice = 500000
        });

        // 5. Create Return Request
        var returnRequest = new ReturnRequest
        {
            OrderId = order.Id,
            UserId = buyer.Id,
            Reason = request.Reason,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            EvidenceImages = "[\"https://picsum.photos/400/300?random=1\", \"https://picsum.photos/400/300?random=2\"]",
            ShopSolution = "Seller has not proposed a solution yet."
        };

        _context.ReturnRequests.Add(returnRequest);

        // 6. Create initial Chat Messages
        var initialMessages = new List<Message>
        {
            new Message { SenderId = buyer.Id, ReceiverId = seller.Id, Content = "Hi, the item I received is defective. The screen won't turn on.", Timestamp = DateTime.UtcNow.AddHours(-2) },
            new Message { SenderId = seller.Id, ReceiverId = buyer.Id, Content = "Sorry to hear that. Did you try charging it?", Timestamp = DateTime.UtcNow.AddHours(-1) },
            new Message { SenderId = buyer.Id, ReceiverId = seller.Id, Content = "Yes, I charged it for 4 hours. It's completely dead. I'm opening a return request.", Timestamp = DateTime.UtcNow }
        };
        _context.Messages.AddRange(initialMessages);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
