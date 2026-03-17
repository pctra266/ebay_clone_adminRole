using EbayClone.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Stats.Queries;

public record DailyUserGrowthDto(DateTime Date, int NewBuyers, int NewSellers);

public record UserGrowthStatsDto
{
    public int TotalNewBuyers  { get; init; }
    public int TotalNewSellers { get; init; }
    public List<DailyUserGrowthDto> DailyGrowth { get; init; } = new();
}

public record GetUserGrowthStatsQuery(DateTime? StartDate, DateTime? EndDate) : IRequest<UserGrowthStatsDto>;

public class GetUserGrowthStatsQueryHandler : IRequestHandler<GetUserGrowthStatsQuery, UserGrowthStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetUserGrowthStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserGrowthStatsDto> Handle(GetUserGrowthStatsQuery request, CancellationToken cancellationToken)
    {
        var start = request.StartDate?.ToUniversalTime() ?? DateTime.UtcNow.Date;
        var end   = request.EndDate?.ToUniversalTime()   ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        // Use ApprovedAt as registration/join date proxy (same pattern as existing queries)
        var usersInRange = await _context.Users
            .AsNoTracking()
            .Where(u => u.ApprovedAt != null && u.ApprovedAt >= start && u.ApprovedAt <= end)
            .Select(u => new { u.ApprovedAt, u.Role })
            .ToListAsync(cancellationToken);

        var grouped = usersInRange
            .GroupBy(u => u.ApprovedAt!.Value.Date)
            .Select(g => new DailyUserGrowthDto(
                g.Key,
                g.Count(u => u.Role == "Buyer"  || u.Role == "buyer"),
                g.Count(u => u.Role == "Seller" || u.Role == "seller")
            ))
            .OrderBy(x => x.Date)
            .ToList();

        return new UserGrowthStatsDto
        {
            TotalNewBuyers  = usersInRange.Count(u => u.Role == "Buyer"  || u.Role == "buyer"),
            TotalNewSellers = usersInRange.Count(u => u.Role == "Seller" || u.Role == "seller"),
            DailyGrowth     = grouped
        };
    }
}
