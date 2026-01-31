using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EbayClone.Infrastructure.Data.Seeders;

public class SellerWalletsSeeder : ISeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SellerWalletsSeeder> _logger;

    public int Order => 5;

    public SellerWalletsSeeder(ApplicationDbContext context, ILogger<SellerWalletsSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        var sellers = await _context.Users
            .Where(u => u.Role == "Seller")
            .ToListAsync();

        if (!sellers.Any())
        {
            _logger.LogWarning("No sellers found to create wallets");
            return;
        }

        var walletsCreated = 0;

        foreach (var seller in sellers)
        {
            if (!await _context.SellerWallets.AnyAsync(w => w.SellerId == seller.Id))
            {
                _context.SellerWallets.Add(new SellerWallet
                {
                    SellerId = seller.Id,
                    PendingBalance = 0,
                    AvailableBalance = 0,
                    TotalEarnings = 0,
                    TotalWithdrawn = 0,
                    UpdatedAt = DateTime.UtcNow
                });
                walletsCreated++;
            }
        }

        if (walletsCreated > 0)
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} Seller Wallets", walletsCreated);
        }
        else
        {
            _logger.LogInformation("Seller Wallets already seeded, skipping...");
        }
    }
}
