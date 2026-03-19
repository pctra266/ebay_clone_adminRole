using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Sellers.Commands.EvaluateSellerLevels;

public record EvaluateSellerLevelsCommand : IRequest<int>;

public class EvaluateSellerLevelsCommandHandler : IRequestHandler<EvaluateSellerLevelsCommand, int>
{
    private readonly IApplicationDbContext _context;

    public EvaluateSellerLevelsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(EvaluateSellerLevelsCommand request, CancellationToken cancellationToken)
    {
        var sellers = await _context.Users
            .Where(u => u.Role == "Seller" || _context.Stores.Any(s => s.SellerId == u.Id))
            .ToListAsync(cancellationToken);

        int updatedCount = 0;
        var now = DateTime.UtcNow;

        foreach (var seller in sellers)
        {
            // Calculate total transactions in last 3 months
            var threeMonthsAgo = now.AddMonths(-3);
            var threeMonthOrders = await _context.OrderTables
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.OrderItems.Any(oi => oi.Product != null && oi.Product.SellerId == seller.Id) && o.OrderDate >= threeMonthsAgo)
                .ToListAsync(cancellationToken);

            int transactionCount = threeMonthOrders.Count;
            var evaluationPeriod = threeMonthsAgo;

            // If < 400 transactions in 3 months, look back 12 months
            if (transactionCount < 400)
            {
                evaluationPeriod = now.AddMonths(-12);
                threeMonthOrders = await _context.OrderTables
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Where(o => o.OrderItems.Any(oi => oi.Product != null && oi.Product.SellerId == seller.Id) && o.OrderDate >= evaluationPeriod)
                    .ToListAsync(cancellationToken);
                
                transactionCount = threeMonthOrders.Count;
            }

            // Sales Volume
            var totalSales = threeMonthOrders.Sum(o => o.TotalPrice ?? 0);

            // Metrics
            // 1. Cases Closed Without Seller Resolution (Disputes unresolved by seller)
            // Assuming Status "Escalated" or "RefundedByPlatform" implies closed without resolution
            var unresolvedCases = await _context.Disputes
                .Where(d => d.Order != null && d.Order.OrderItems.Any(oi => oi.Product != null && oi.Product.SellerId == seller.Id) && d.CreatedAt >= evaluationPeriod && 
                            (d.Status == "ClosedWithoutResolution" || d.Status == "Escalated"))
                .CountAsync(cancellationToken);

            double unresolvedRate = transactionCount > 0 ? (double)unresolvedCases / transactionCount : 0;

            // 2. Transaction Defect Rate (Return Requests with issues + unresolved disputes + cancellations)
            var returnDefects = await _context.ReturnRequests
                .Include(r => r.Order)
                .ThenInclude(o => o!.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(r => r.Order != null && r.Order.OrderItems.Any(oi => oi.Product != null && oi.Product.SellerId == seller.Id) && 
                            r.CreatedAt >= evaluationPeriod && r.Status == "Refunded")
                .CountAsync(cancellationToken);
            
            var totalDefects = unresolvedCases + returnDefects; // simplified defect counting
            double defectRate = transactionCount > 0 ? (double)totalDefects / transactionCount : 0;

            // 3. Late Shipment (Using mock simple condition: completedAt > OrderDate + 7 days for now, or just dummy)
            var lateShipments = threeMonthOrders.Count(o => o.CompletedAt.HasValue && o.OrderDate.HasValue && 
                                                            (o.CompletedAt.Value - o.OrderDate.Value).TotalDays > 7);
            double lateRate = transactionCount > 0 ? (double)lateShipments / transactionCount : 0;

            // Evaluate Level
            string newLevel = "BelowStandard";

            // Is Top Rated?
            bool isTopRated = transactionCount >= 100 && 
                              totalSales >= 1000 && 
                              (now - (seller.ApprovedAt ?? now.AddDays(-100))).TotalDays >= 90 &&
                              unresolvedCases <= 2 &&
                              defectRate <= 0.005 &&
                              lateRate <= 0.03;

            // Is Above Standard?
            bool isAboveStandard = !isTopRated && 
                                   defectRate <= 0.02 && 
                                   (unresolvedCases <= 2 || unresolvedRate <= 0.003);

            if (isTopRated) newLevel = "TopRated";
            else if (isAboveStandard) newLevel = "AboveStandard";

            if (seller.SellerLevel != newLevel)
            {
                seller.SellerLevel = newLevel;
                updatedCount++;
            }
        }

        if (updatedCount > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return updatedCount;
    }
}
