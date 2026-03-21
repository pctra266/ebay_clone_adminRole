using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace EbayClone.Infrastructure.Data.Interceptors;

/// <summary>
/// Intercepts any SaveChanges that modifies SellerWallet rows
/// and broadcasts the updated balances to all admin clients via SignalR.
/// This is the single source of truth for real-time updates — no matter
/// which code path mutates a wallet, admins on /sellers will see it instantly.
/// </summary>
public class SellerWalletChangedInterceptor : SaveChangesInterceptor
{
    private readonly ISellerHubService _sellerHubService;

    public SellerWalletChangedInterceptor(ISellerHubService sellerHubService)
    {
        _sellerHubService = sellerHubService;
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        await BroadcastWalletChanges(eventData.Context);
        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        BroadcastWalletChanges(eventData.Context).GetAwaiter().GetResult();
        return base.SavedChanges(eventData, result);
    }

    private async Task BroadcastWalletChanges(DbContext? context)
    {
        if (context == null) return;

        var changedWallets = context.ChangeTracker
            .Entries<SellerWallet>()
            .Where(e => e.State == EntityState.Modified
                     || e.State == EntityState.Added)
            .Select(e => e.Entity)
            .ToList();

        foreach (var wallet in changedWallets)
        {
            try
            {
                await _sellerHubService.BroadcastWalletUpdate(
                    wallet.SellerId,
                    wallet.AvailableBalance,
                    wallet.PendingBalance,
                    wallet.TotalWithdrawn);
            }
            catch
            {
                // Never let SignalR failures affect the main transaction
            }
        }
    }
}
