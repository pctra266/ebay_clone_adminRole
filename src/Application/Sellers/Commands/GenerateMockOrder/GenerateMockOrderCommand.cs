using EbayClone.Application.Common.Interfaces;
using EbayClone.Application.Financials.Commands.SettlePendingFunds;
using EbayClone.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Sellers.Commands.GenerateMockOrder;

public record GenerateMockOrderCommand : IRequest<bool>
{
    public int SellerId { get; init; }
    public string OrderType { get; init; } = "Normal";
    public decimal Amount { get; init; } = 500000;
    public bool SettleImmediately { get; init; } = false;
    public bool EnsureBankLinked { get; init; } = true;
}

public class GenerateMockOrderCommandHandler : IRequestHandler<GenerateMockOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ISender _sender;

    public GenerateMockOrderCommandHandler(IApplicationDbContext context, ISender sender)
    {
        _context = context;
        _sender = sender;
    }

    public async Task<bool> Handle(GenerateMockOrderCommand request, CancellationToken cancellationToken)
    {
        var seller = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.SellerId && (u.Role == "Seller" || _context.Stores.Any(s => s.SellerId == u.Id)), cancellationToken);

        if (seller == null)
            throw new ArgumentException($"Seller with ID '{request.SellerId}' not found.");

        var buyer = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Buyer", cancellationToken);
        if (buyer == null)
        {
            // Just use the first user if no buyer is found
            buyer = await _context.Users.FirstOrDefaultAsync(cancellationToken);
        }

        // Find or create a dummy product for the seller
        var product = await _context.Products.FirstOrDefaultAsync(p => p.SellerId == seller.Id, cancellationToken);
        if (product == null)
        {
            product = new Product
            {
                Title = "Dummy Product for " + seller.Username,
                Description = "Mocking product",
                Price = request.Amount,
                CategoryId = 1, // assumes category 1 exists
                SellerId = seller.Id,
                Status = "Active"
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var orderDate = DateTime.UtcNow.AddHours(-1);
        var completedAt = DateTime.UtcNow;
        var status = "Delivered";

        if (request.OrderType == "LateShipment")
        {
            // Took 10 days to deliver instead of < 7
            completedAt = orderDate.AddDays(10);
        }

        var platformFee = request.Amount * 0.05m;
        var sellerEarnings = request.Amount - platformFee;

        // hold days rule
        int holdDays = (seller.SellerLevel?.ToLowerInvariant()) switch
        {
            "toprated" => 0,
            "abovestandard" => 3,
            _ => 21
        };

        if (request.SettleImmediately)
        {
            holdDays = 0;
        }

        if (request.EnsureBankLinked && string.IsNullOrEmpty(seller.BankAccountMock))
        {
            seller.BankAccountMock = "{\"bankName\": \"Mock Test Bank\", \"accountNumber\": \"123456789\", \"accountName\": \"" + seller.Username + "\"}";
        }

        var order = new OrderTable
        {
            BuyerId = buyer!.Id,
            OrderDate = orderDate,
            TotalPrice = request.Amount,
            Status = status,
            CompletedAt = completedAt,
            EstimatedSettlementDate = completedAt.AddDays(holdDays),
            CanDisputeUntil = completedAt.AddDays(14),
            PlatformFee = platformFee,
            SellerEarnings = sellerEarnings
        };

        _context.OrderTables.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        // Add OrderItem
        _context.OrderItems.Add(new OrderItem
        {
            OrderId = order.Id,
            ProductId = product.Id,
            Quantity = 1,
            UnitPrice = request.Amount
        });

        // Add to Wallet Pending
        var wallet = await _context.SellerWallets.FirstOrDefaultAsync(w => w.SellerId == seller.Id, cancellationToken);
        if (wallet == null)
        {
            wallet = new SellerWallet { SellerId = seller.Id, AvailableBalance = 0, PendingBalance = 0, LockedBalance = 0 };
            _context.SellerWallets.Add(wallet);
        }
        
        wallet.CreditPending(sellerEarnings);
        await _context.SaveChangesAsync(cancellationToken);

        // Handle specific metrics failures AFTER completed
        if (request.OrderType == "DisputeUnresolved")
        {
            var dispute = new Dispute
            {
                OrderId = order.Id,
                RaisedBy = buyer.Id,
                Type = "INAD",
                Description = "Mock dispute",
                Status = "Escalated",
                CreatedAt = orderDate.AddDays(5)
            };
            _context.Disputes.Add(dispute);
        }

        if (request.OrderType == "ReturnRefunded")
        {
            var returnRequest = new ReturnRequest
            {
                OrderId = order.Id,
                UserId = buyer.Id,
                Reason = "Damaged",
                Status = "Refunded",
                CreatedAt = orderDate.AddDays(5)
            };
            _context.ReturnRequests.Add(returnRequest);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Auto-trigger settlement to process the mock order if it's eligible (e.g. TopRated)
        try
        {
            await _sender.Send(new SettlePendingFundsCommand(), cancellationToken);
        }
        catch (Exception)
        {
            // Fail silently for mock orders if settlement trigger fails
        }

        return true;
    }
}
