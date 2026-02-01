using Microsoft.Extensions.Logging;
using EbayClone.Domain.Entities;

namespace EbayClone.Infrastructure.Data.Seeders;

public class UsersSeeder : ISeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UsersSeeder> _logger;

    public int Order => 4;

    public UsersSeeder(ApplicationDbContext context, ILogger<UsersSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (_context.Users.Any())
        {
            _logger.LogInformation("Users already seeded, skipping...");
            return;
        }

        var users = new List<User>
        {
            new User
            {
                Username = "john_buyer",
                Email = "john@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "Buyer",
                Status = "Active",
                ApprovalStatus = "Approved",
                IsVerified = true,
                ViolationCount = 0,
                TwoFactorEnabled = false,
                AvatarUrl = null
            },
            new User
            {
                Username = "tech_seller_pro",
                Email = "techseller@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "Seller",
                Status = "Active",
                ApprovalStatus = "Approved",
                IsVerified = true,
                ViolationCount = 0,
                TwoFactorEnabled = true,
                AvatarUrl = null
            },
            new User
            {
                Username = "fashion_boutique",
                Email = "fashion@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "Seller",
                Status = "Active",
                ApprovalStatus = "Approved",
                IsVerified = true,
                ViolationCount = 0,
                TwoFactorEnabled = false,
                AvatarUrl = null
            },
            new User
            {
                Username = "pending_seller",
                Email = "pending@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "Seller",
                Status = "Active",
                ApprovalStatus = "PendingApproval",
                IsVerified = false,
                ViolationCount = 0,
                TwoFactorEnabled = false,
                AvatarUrl = null
            },
            new User
            {
                Username = "collectibles_expert",
                Email = "collectibles@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "Seller",
                Status = "Active",
                ApprovalStatus = "Approved",
                IsVerified = true,
                ViolationCount = 0,
                TwoFactorEnabled = false,
                AvatarUrl = null
            }
        };

        _context.Users.AddRange(users);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} Sample Users", users.Count);
    }
}
