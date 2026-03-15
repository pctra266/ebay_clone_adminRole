using EbayClone.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EbayClone.Infrastructure.Data.Seeders;

public class ReturnRequestsSeeder : ISeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ReturnRequestsSeeder> _logger;

    public int Order => 10; // After DisputesSeeder (9)

    public ReturnRequestsSeeder(ApplicationDbContext context, ILogger<ReturnRequestsSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (await _context.ReturnRequests.AnyAsync())
        {
            _logger.LogInformation("ReturnRequests already seeded, skipping...");
            return;
        }

        var johnBuyer = await _context.Users.FirstOrDefaultAsync(u => u.Username == "john_buyer");
        var fashionSeller = await _context.Users.FirstOrDefaultAsync(u => u.Username == "fashion_boutique");

        if (johnBuyer == null || fashionSeller == null)
        {
            _logger.LogWarning("Required users not found for return request seeding");
            return;
        }

        // Create sample orders for return requests
        var rrOrders = new List<OrderTable>
        {
            new OrderTable
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-20),
                TotalPrice = 500.00m,
                Status = "Delivered",
                CompletedAt = DateTime.UtcNow.AddDays(-15),
                PlatformFee = 64.50m,
                SellerEarnings = 435.50m
            },
            new OrderTable
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-10),
                TotalPrice = 250.00m,
                Status = "Delivered",
                CompletedAt = DateTime.UtcNow.AddDays(-5),
                PlatformFee = 32.25m,
                SellerEarnings = 217.75m
            },
            new OrderTable
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-5),
                TotalPrice = 120.00m,
                Status = "Delivered",
                CompletedAt = DateTime.UtcNow.AddDays(-2),
                PlatformFee = 15.48m,
                SellerEarnings = 104.52m
            },
            new OrderTable
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-2),
                TotalPrice = 1000.00m,
                Status = "Delivered",
                CompletedAt = DateTime.UtcNow.AddDays(-1),
                PlatformFee = 129.00m,
                SellerEarnings = 871.00m
            }
        };

        _context.OrderTables.AddRange(rrOrders);
        await _context.SaveChangesAsync();

        var returnRequests = new List<ReturnRequest>
        {
            // Case 1: Pending review
            new ReturnRequest
            {
                OrderId = rrOrders[0].Id,
                UserId = johnBuyer.Id,
                Reason = "Item defective - screen won't turn on",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                EvidenceImages = "[\"https://picsum.photos/400/300?random=1\", \"https://picsum.photos/400/300?random=2\"]",
                ShopSolution = "Seller offered 10% partial refund but I want full return."
            },

            // Case 2: Escalated to Admin
            new ReturnRequest
            {
                OrderId = rrOrders[1].Id,
                UserId = johnBuyer.Id,
                Reason = "Item mismatch - Received Red instead of Blue",
                Status = "Escalated",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                EvidenceImages = "[\"https://picsum.photos/400/300?random=3\"]",
                ShopSolution = "Seller claims they sent the right color and refused return."
            },

            // Case 3: Waiting for Local Label
            new ReturnRequest
            {
                OrderId = rrOrders[2].Id,
                UserId = johnBuyer.Id,
                Reason = "Doesn't fit - ordered XL but fits like M",
                Status = "WaitingForReturnLabel",
                CreatedAt = DateTime.UtcNow.AddDays(-7),
                ResolvedAt = DateTime.UtcNow.AddDays(-1),
                AdminNote = "Admin adjudicated: Fashion Boutique must provide shipping label as sizing chart was misleading.",
                ResolutionAction = "RequireReturn",
                EvidenceImages = "[\"https://picsum.photos/400/300?random=4\"]"
            },

            // Case 4: Already Approved (Closed)
            new ReturnRequest
            {
                OrderId = rrOrders[3].Id,
                UserId = johnBuyer.Id,
                Reason = "Counterfeit suspected - Logo is printed incorrectly",
                Status = "Approved",
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                ResolvedAt = DateTime.UtcNow.AddDays(-8),
                AdminNote = "Counterfeit verified by serial number check. Immediate refund issued via Ebay Fund.",
                ResolutionAction = "RefundWithoutReturn",
                IsRefundedByEbayFund = true,
                EvidenceImages = "[\"https://picsum.photos/400/300?random=5\", \"https://picsum.photos/400/300?random=6\"]"
            }
        };

        _context.ReturnRequests.AddRange(returnRequests);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} Sample Return Requests", returnRequests.Count);
    }
}
