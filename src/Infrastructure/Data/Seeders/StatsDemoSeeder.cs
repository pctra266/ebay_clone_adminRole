using EbayClone.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EbayClone.Infrastructure.Data.Seeders;

/// <summary>
/// Seeds realistic demo data for the Statistics Report screen:
///  - 90 days of FeeDeduction transactions (revenue)
///  - 60 extra users with ApprovedAt spread over 90 days (Buyers + Sellers)
///  - 90 days of orders with varied statuses (Completed / Delivered / Returned)
/// Guard: checks a sentinel FinancialTransaction so seeder is idempotent.
/// </summary>
public class StatsDemoSeeder : ISeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<StatsDemoSeeder> _logger;

    public int Order => 12; // Run after FinanceDemoSeeder

    public StatsDemoSeeder(ApplicationDbContext context, ILogger<StatsDemoSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        // Idempotency guard
        if (await _context.FinancialTransactions.AnyAsync(t => t.Description == "StatsDemoSeeder-v1"))
        {
            _logger.LogInformation("StatsDemoSeeder already ran, skipping.");
            return;
        }

        var now = DateTime.UtcNow;
        var rng = new Random(42); // fixed seed → reproducible data

        // ──────────────────────────────────────────────────────────────
        // 1. USERS – 60 extra users spread over 90 days
        // ──────────────────────────────────────────────────────────────
        _logger.LogInformation("Seeding demo users...");
        var newUsers = new List<User>();
        for (int i = 1; i <= 60; i++)
        {
            var daysAgo = rng.Next(1, 91);
            var isSeller = (i % 3 == 0); // 20 sellers, 40 buyers
            var approvedAt = now.AddDays(-daysAgo).AddHours(rng.Next(0, 23));
            newUsers.Add(new User
            {
                Username       = $"demo_{(isSeller ? "seller" : "buyer")}_{i:D3}",
                Email          = $"demo.user.{i}@stats.local",
                Password       = BCrypt.Net.BCrypt.HashPassword("Demo123!"),
                Role           = isSeller ? "Seller" : "Buyer",
                Status         = "Active",
                ApprovalStatus = "Approved",
                ApprovedAt     = approvedAt,
                IsVerified     = true,
                TwoFactorEnabled = false
            });
        }
        _context.Users.AddRange(newUsers);
        await _context.SaveChangesAsync();

        // ──────────────────────────────────────────────────────────────
        // 2. ORDERS – 180 orders spread over 90 days, varied statuses
        // ──────────────────────────────────────────────────────────────
        _logger.LogInformation("Seeding demo orders...");

        // Pick an existing buyer to attach orders to
        var buyer = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Buyer");
        if (buyer == null)
        {
            _logger.LogWarning("No buyer found for demo orders. Skipping order seed.");
        }
        else
        {
            // Status distribution (realistic):  ~55% Completed, ~30% Delivered, ~15% Returned
            var statusPool = new[]
            {
                "Completed","Completed","Completed","Completed","Completed","Completed",
                "Delivered","Delivered","Delivered","Delivered",
                "Returned","Returned"
            };

            var demoOrders = new List<OrderTable>();
            for (int i = 0; i < 180; i++)
            {
                var daysAgo    = rng.Next(1, 91);
                var orderDate  = now.AddDays(-daysAgo).AddHours(rng.Next(0, 23));
                var status     = statusPool[rng.Next(statusPool.Length)];
                var basePrice  = rng.Next(50_000, 5_000_001); // 50K – 5M VND
                var fee        = (decimal)(basePrice * 0.05); // 5% platform fee
                var earnings   = basePrice - (int)fee;

                demoOrders.Add(new OrderTable
                {
                    BuyerId       = buyer.Id,
                    OrderDate     = orderDate,
                    TotalPrice    = basePrice,
                    Status        = status,
                    CompletedAt   = status != "Returned" ? orderDate.AddDays(rng.Next(2, 8)) : null,
                    CanDisputeUntil = orderDate.AddDays(14),
                    PlatformFee   = fee,
                    SellerEarnings = earnings
                });
            }
            _context.OrderTables.AddRange(demoOrders);
            await _context.SaveChangesAsync();
        }

        // ──────────────────────────────────────────────────────────────
        // 3. REVENUE – FeeDeduction transactions, one batch per day
        //    Pattern: weekdays spike, weekends dip; growing trend
        // ──────────────────────────────────────────────────────────────
        _logger.LogInformation("Seeding demo revenue transactions...");

        // Need a valid UserId – use the system/admin user (id 1 fallback)
        var systemUser = await _context.Users.OrderBy(u => u.Id).FirstOrDefaultAsync();
        var systemUserId = systemUser?.Id ?? 1;
        var transactions = new List<FinancialTransaction>();
        for (int day = 90; day >= 1; day--)
        {
            var date = now.Date.AddDays(-day);
            var isWeekend = date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;

            // Base: grows from ~2M on day 90 to ~12M on day 1
            double trend  = 2_000_000 + (90 - day) * 115_000.0;
            double noise  = (rng.NextDouble() - 0.45) * 800_000;
            double weekMod = isWeekend ? 0.55 : 1.0;
            var amount = (decimal)Math.Max(200_000, (trend + noise) * weekMod);

            // Split into 3–8 individual transactions per day for realism
            int txCount = rng.Next(3, 9);
            var remaining = amount;
            for (int t = 0; t < txCount; t++)
            {
                decimal slice = t == txCount - 1
                    ? remaining
                    : (decimal)(rng.NextDouble() * (double)remaining * 0.5);
                remaining -= slice;
                if (slice < 1000) slice = 1000;

                transactions.Add(new FinancialTransaction
                {
                    Type        = "FeeDeduction",
                    Amount      = slice,
                    BalanceAfter = 0,
                    UserId      = systemUserId,
                    SellerId    = systemUserId,
                    Date        = date.AddHours(rng.Next(8, 22)).AddMinutes(rng.Next(0, 60)),
                    Description = "StatsDemoSeeder-v1",
                });
            }
        }
        _context.FinancialTransactions.AddRange(transactions);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "StatsDemoSeeder done: 60 users, 180 orders, {Count} revenue transactions.",
            transactions.Count);
    }
}
