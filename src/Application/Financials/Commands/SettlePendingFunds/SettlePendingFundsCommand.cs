using EbayClone.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Financials.Commands.SettlePendingFunds;

public record SettlePendingFundsCommand : IRequest<int>;

public class SettlePendingFundsCommandHandler : IRequestHandler<SettlePendingFundsCommand, int>
{
    private readonly IApplicationDbContext _context;

    public SettlePendingFundsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(SettlePendingFundsCommand request, CancellationToken cancellationToken)
    {
        // 1. Find orders that are delivered and past the dispute window
        // For simplicity, we use DateTime.UtcNow. In production, this might be a scheduled job.
        var eligibleOrders = await _context.OrderTables
            .Where(o => o.Status == "Delivered" && o.CompletedAt != null && o.CanDisputeUntil < DateTime.UtcNow)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .ToListAsync(cancellationToken);

        int settledCount = 0;

        foreach (var order in eligibleOrders)
        {
            // Assuming one seller per order for simplicity, or we group by seller
            var sellerIds = order.OrderItems
                .Select(oi => oi.Product?.SellerId)
                .Where(s => s.HasValue)
                .Select(s => s!.Value)
                .Distinct();

            foreach (var sellerId in sellerIds)
            {
                var wallet = await _context.SellerWallets
                    .FirstOrDefaultAsync(w => w.SellerId == sellerId, cancellationToken);

                if (wallet != null)
                {
                    // In a real system, we'd calculate exactly how much of THIS order goes to THIS seller.
                    // Here we assume SellerEarnings from OrderTable is pre-calculated.
                    var amountToSettle = order.SellerEarnings ?? 0;
                    
                    if (amountToSettle > 0)
                    {
                        wallet.MovePendingToAvailable(amountToSettle);
                        
                        // Update order status to indicate funds are cleared
                        order.Status = "FundsCleared"; 
                        settledCount++;
                    }
                }
            }
        }

        if (settledCount > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return settledCount;
    }
}
