using Microsoft.Extensions.Logging;

namespace EbayClone.Infrastructure.Data.Seeders;

public class AdminRolesSeeder : ISeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminRolesSeeder> _logger;

    public int Order => 1;

    public AdminRolesSeeder(ApplicationDbContext context, ILogger<AdminRolesSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (_context.AdminRoles.Any())
        {
            _logger.LogInformation("AdminRoles already seeded, skipping...");
            return;
        }

        var adminRoles = new List<AdminRole>
        {
            new AdminRole
            {
                RoleName = "SuperAdmin",
                Description = "Full system access - Can manage everything",
                Permissions = "[\"*\"]",
                CreatedAt = DateTime.UtcNow
            },
            new AdminRole
            {
                RoleName = "Monitor",
                Description = "Read-only access to monitor system health and metrics",
                Permissions = "[\"ViewDashboard\",\"ViewReports\",\"ViewUsers\",\"ViewProducts\",\"ViewOrders\",\"ViewAnalytics\"]",
                CreatedAt = DateTime.UtcNow
            },
            new AdminRole
            {
                RoleName = "Support",
                Description = "Customer support - Handle disputes, returns, and user issues",
                Permissions = "[\"ViewDashboard\",\"ManageDisputes\",\"ManageReturns\",\"ViewUsers\",\"ViewOrders\",\"SendNotifications\"]",
                CreatedAt = DateTime.UtcNow
            },
            new AdminRole
            {
                RoleName = "ContentModerator",
                Description = "Moderate products, reviews, and handle reports",
                Permissions = "[\"ViewDashboard\",\"ModerateProducts\",\"ModerateReviews\",\"HandleReports\",\"ViewUsers\"]",
                CreatedAt = DateTime.UtcNow
            },
            new AdminRole
            {
                RoleName = "FinanceManager",
                Description = "Manage platform fees and withdrawal requests",
                Permissions = "[\"ViewDashboard\",\"ManagePlatformFees\",\"ProcessWithdrawals\",\"ViewFinancialReports\"]",
                CreatedAt = DateTime.UtcNow
            }
        };

        _context.AdminRoles.AddRange(adminRoles);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} Admin Roles", adminRoles.Count);
    }
}
