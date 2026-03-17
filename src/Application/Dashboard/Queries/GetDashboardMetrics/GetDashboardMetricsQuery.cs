using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Dashboard.Queries.GetDashboardMetrics;

public record GetDashboardMetricsQuery : IRequest<DashboardMetricsDto>;

public class GetDashboardMetricsQueryHandler : IRequestHandler<GetDashboardMetricsQuery, DashboardMetricsDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardMetricsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardMetricsDto> Handle(GetDashboardMetricsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var today = now.Date;
        var sevenDaysAgo = today.AddDays(-6);

        var totalUsers = await _context.Users.CountAsync(cancellationToken);
        var totalProducts = await _context.Products.CountAsync(cancellationToken);
        
        var totalOrdersToday = await _context.OrderTables
            .CountAsync(o => o.OrderDate >= today, cancellationToken);

        var pendingAccountsCount = await _context.Users
            .CountAsync(u => u.ApprovalStatus == "PendingApproval" || u.Status == "Pending", cancellationToken);

        var openDisputesCount = await _context.Disputes
            .CountAsync(d => d.Status == DisputeStatuses.Open || 
                             d.Status == DisputeStatuses.AwaitingSellerResponse ||
                             d.Status == DisputeStatuses.Escalated ||
                             d.Status == DisputeStatuses.UnderReview ||
                             d.Status == DisputeStatuses.AssignedToAdmin, 
                        cancellationToken);

        var newReturnRequestsCount = await _context.ReturnRequests
            .CountAsync(r => r.Status == "Pending", cancellationToken);

        // Weekly Revenue Chart Data
        var ordersLast7Days = await _context.OrderTables
            .Where(o => o.OrderDate >= sevenDaysAgo)
            .Select(o => new { o.OrderDate, o.TotalPrice })
            .ToListAsync(cancellationToken);

        var weeklyRevenue = new List<DailyRevenueDto>();
        for (int i = 0; i < 7; i++)
        {
            var date = sevenDaysAgo.AddDays(i);
            var dailyTotal = ordersLast7Days
                .Where(o => o.OrderDate.HasValue && o.OrderDate.Value.Date == date)
                .Sum(o => o.TotalPrice ?? 0);

            weeklyRevenue.Add(new DailyRevenueDto
            {
                Date = date.ToString("yyyy-MM-dd"),
                Revenue = dailyTotal
            });
        }

        return new DashboardMetricsDto
        {
            TotalUsers = totalUsers,
            TotalProducts = totalProducts,
            TotalOrdersToday = totalOrdersToday,
            PendingAccountsCount = pendingAccountsCount,
            OpenDisputesCount = openDisputesCount,
            NewReturnRequestsCount = newReturnRequestsCount,
            WeeklyRevenue = weeklyRevenue
        };
    }
}
