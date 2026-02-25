using EbayClone.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<AdminRole> AdminRoles { get; }
    DbSet<AdminUserRole> AdminUserRoles { get; }
    DbSet<AdminAction> AdminActions { get; }
    DbSet<Notification> Notifications { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

