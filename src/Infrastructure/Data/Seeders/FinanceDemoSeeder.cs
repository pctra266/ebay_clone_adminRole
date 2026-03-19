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
        //await SeedSettlementDemoAsync();

        // 2. Setup Demo Data for Withdrawals (Pending/Approval/Rejection)
        await SeedWithdrawalDemoAsync();
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
