using EbayClone.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Stats.Queries;

public record OrderStatsDto
{
    public int Completed { get; init; }
    public int Delivered { get; init; }
    public int Returned  { get; init; }
    public int Total     { get; init; }
}

public record GetOrderStatsQuery(DateTime? StartDate, DateTime? EndDate) : IRequest<OrderStatsDto>;

public class GetOrderStatsQueryHandler : IRequestHandler<GetOrderStatsQuery, OrderStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetOrderStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderStatsDto> Handle(GetOrderStatsQuery request, CancellationToken cancellationToken)
    {
        var start = request.StartDate?.ToUniversalTime() ?? DateTime.UtcNow.Date;
        var end   = request.EndDate?.ToUniversalTime()   ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        var orders = await _context.OrderTables
            .AsNoTracking()
            .Where(o => o.OrderDate != null && o.OrderDate >= start && o.OrderDate <= end)
            .Select(o => o.Status)
            .ToListAsync(cancellationToken);

        var completed = orders.Count(s => s == "Completed");
        var delivered = orders.Count(s => s == "Delivered");
        var returned  = orders.Count(s => s == "Returned"  || s == "ReturnApproved");

        return new OrderStatsDto
        {
            Completed = completed,
            Delivered = delivered,
            Returned  = returned,
            Total     = orders.Count
        };
    }
}
