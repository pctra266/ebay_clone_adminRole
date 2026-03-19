using EbayClone.Domain.Constants;
using EbayClone.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EbayClone.Infrastructure.Data.Seeders;

public class FinanceDemoSeeder : ISeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FinanceDemoSeeder> _logger;

    public int Order => 10; // Run after Disputes and Products

    public FinanceDemoSeeder(ApplicationDbContext context, ILogger<FinanceDemoSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        // 1. Setup Demo Data for Settlement (Pending -> Available)
        await SeedSettlementDemoAsync();

        // 2. Setup Demo Data for Withdrawals (Pending/Approval/Rejection)
        await SeedWithdrawalDemoAsync();
    }

    private async Task SeedSettlementDemoAsync()
    {
        var techSeller = await _context.Users.FirstOrDefaultAsync(u => u.Username == "tech_seller_pro");
        var fashionSeller = await _context.Users.FirstOrDefaultAsync(u => u.Username == "fashion_boutique");
        var johnBuyer = await _context.Users.FirstOrDefaultAsync(u => u.Username == "john_buyer");
        
        var productTech = await _context.Products.FirstOrDefaultAsync(p => p.SellerId == techSeller!.Id);
        var productFashion = await _context.Products.FirstOrDefaultAsync(p => p.SellerId == fashionSeller!.Id);

        if (techSeller == null || fashionSeller == null || johnBuyer == null || productTech == null) return;

        // Helper to grab hold days
        int GetHoldDays(string? level) => level switch
        {
            "TopRated" => 0,
            "AboveStandard" => 3,
            _ => 21
        };

        // --- Demo Set 1: tech_seller_pro (2 orders) ---
        var existingTechOrders = await _context.OrderTables.Where(o => o.BuyerId == johnBuyer.Id && o.SellerEarnings == 1000000).ToListAsync();
        var holdDaysTech = GetHoldDays(techSeller.SellerLevel);
        var completedAt1 = DateTime.UtcNow.AddDays(-15);
        var completedAt2 = DateTime.UtcNow.AddDays(-18);

        if (!existingTechOrders.Any())
        {
            var orders = new List<OrderTable>
            {
                new OrderTable {
                    BuyerId = johnBuyer.Id, OrderDate = DateTime.UtcNow.AddDays(-20), TotalPrice = 1129000, Status = "Delivered",
                    CompletedAt = completedAt1, CanDisputeUntil = DateTime.UtcNow.AddDays(-1), 
                    EstimatedSettlementDate = completedAt1.AddDays(holdDaysTech),
                    PlatformFee = 129000, SellerEarnings = 1000000 
                },
                new OrderTable {
                    BuyerId = johnBuyer.Id, OrderDate = DateTime.UtcNow.AddDays(-25), TotalPrice = 564500, Status = "Delivered",
                    CompletedAt = completedAt2, CanDisputeUntil = DateTime.UtcNow.AddDays(-2), 
                    EstimatedSettlementDate = completedAt2.AddDays(holdDaysTech),
                    PlatformFee = 64500, SellerEarnings = 500000 
                }
            };
            _context.OrderTables.AddRange(orders);
            await _context.SaveChangesAsync();

            foreach(var o in orders) {
                _context.OrderItems.Add(new OrderItem { OrderId = o.Id, ProductId = productTech.Id, Quantity = 1, UnitPrice = o.TotalPrice });
            }

            var walletTech = await _context.SellerWallets.FirstOrDefaultAsync(w => w.SellerId == techSeller.Id);
            if (walletTech != null) walletTech.PendingBalance += 1500000;
        }
        else
        {
            // Update existing orders if they lack EstimatedSettlementDate
            foreach(var o in existingTechOrders) {
                if (o.EstimatedSettlementDate == null && o.CompletedAt.HasValue) {
                    o.EstimatedSettlementDate = o.CompletedAt.Value.AddDays(holdDaysTech);
                }
            }
        }

        // --- Demo Set 2: fashion_boutique (1 order) ---
        var existingFashionOrders = await _context.OrderTables.Where(o => o.BuyerId == johnBuyer.Id && o.SellerEarnings == 750000).ToListAsync();
        var holdDaysFashion = GetHoldDays(fashionSeller.SellerLevel);
        var completedAt = DateTime.UtcNow.AddDays(-10);

        if (!existingFashionOrders.Any())
        {
            var order = new OrderTable {
                BuyerId = johnBuyer.Id, OrderDate = DateTime.UtcNow.AddDays(-15), TotalPrice = 846750, Status = "Delivered",
                CompletedAt = completedAt, CanDisputeUntil = DateTime.UtcNow.AddDays(-1),
                EstimatedSettlementDate = completedAt.AddDays(holdDaysFashion),
                PlatformFee = 96750, SellerEarnings = 750000
            };
            _context.OrderTables.Add(order);
            await _context.SaveChangesAsync();

            _context.OrderItems.Add(new OrderItem { OrderId = order.Id, ProductId = productFashion!.Id, Quantity = 1, UnitPrice = order.TotalPrice });

            var walletFashion = await _context.SellerWallets.FirstOrDefaultAsync(w => w.SellerId == fashionSeller.Id);
            if (walletFashion != null) walletFashion.PendingBalance += 750000;
        }
        else
        {
            foreach(var o in existingFashionOrders) {
                if (o.EstimatedSettlementDate == null && o.CompletedAt.HasValue) {
                    o.EstimatedSettlementDate = o.CompletedAt.Value.AddDays(holdDaysFashion);
                }
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded richer Settlement demo data");
    }

    private async Task SeedWithdrawalDemoAsync()
    {
        var techSeller = await _context.Users.FirstOrDefaultAsync(u => u.Username == "tech_seller_pro");
        var fashionSeller = await _context.Users.FirstOrDefaultAsync(u => u.Username == "fashion_boutique");
        if (techSeller == null || fashionSeller == null) return;

        // --- Withdrawal Demo for tech_seller_pro (2 pending) ---
        var walletTech = await _context.SellerWallets.FirstOrDefaultAsync(w => w.SellerId == techSeller.Id);
        if (walletTech != null && !await _context.WithdrawalRequests.AnyAsync(w => w.SellerId == techSeller.Id && w.Amount == 300000))
        {
            walletTech.AvailableBalance += 3000000;
            var requests = new List<WithdrawalRequest> {
                new WithdrawalRequest { SellerId = techSeller.Id, Amount = 300000, Status = "Pending", BankName = "VCB", BankAccountNumber = "0011...", BankAccountName = "TECH SELLER 1", RequestedAt = DateTime.UtcNow.AddHours(-5) },
                new WithdrawalRequest { SellerId = techSeller.Id, Amount = 700000, Status = "Pending", BankName = "TCB", BankAccountNumber = "0022...", BankAccountName = "TECH SELLER 2", RequestedAt = DateTime.UtcNow.AddHours(-2) }
            };
            _context.WithdrawalRequests.AddRange(requests);
            walletTech.AvailableBalance -= 1000000;
            walletTech.LockedBalance += 1000000;
        }

        // --- Withdrawal Demo for fashion_boutique (1 pending) ---
        var walletFashion = await _context.SellerWallets.FirstOrDefaultAsync(w => w.SellerId == fashionSeller.Id);
        if (walletFashion != null && !await _context.WithdrawalRequests.AnyAsync(w => w.SellerId == fashionSeller.Id))
        {
            walletFashion.AvailableBalance += 1500000;
            var request = new WithdrawalRequest { SellerId = fashionSeller.Id, Amount = 400000, Status = "Pending", BankName = "MBBank", BankAccountNumber = "9999...", BankAccountName = "FASHION SHOP", RequestedAt = DateTime.UtcNow.AddMinutes(-30) };
            _context.WithdrawalRequests.Add(request);
            walletFashion.AvailableBalance -= 400000;
            walletFashion.LockedBalance += 400000;
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded richer Withdrawal demo data");
    }
}
