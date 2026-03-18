using EbayClone.Application.Broadcasts.Queries.GetBroadcasts;
using EbayClone.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EbayClone.Application.Broadcasts.Queries.GetActiveBroadcasts;

public record GetActiveBroadcastsQuery(List<string> UserRoles) : IRequest<List<BroadcastDto>>;

public class GetActiveBroadcastsQueryHandler : IRequestHandler<GetActiveBroadcastsQuery, List<BroadcastDto>>
{
    private readonly IApplicationDbContext _context;

    public GetActiveBroadcastsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BroadcastDto>> Handle(GetActiveBroadcastsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var query = _context.Notifications
            .Include(n => n.Creator)
            .Where(n => n.UserId == null) // Broadcasts only
            .Where(n => n.Status == "Sent" || (n.Status == "Scheduled" && n.ScheduledAt <= now))
            .AsQueryable();

        // If UserRoles is provided, return broadcasts for All or specifically for their roles
        if (request.UserRoles != null && request.UserRoles.Any())
        {
            query = query.Where(n => string.IsNullOrEmpty(n.UserRole) || request.UserRoles.Contains(n.UserRole));
        }
        else
        {
            // If they have no role (or are logged out somehow but hitting this), only show "All"
            query = query.Where(n => string.IsNullOrEmpty(n.UserRole));
        }

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new BroadcastDto
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                UserRole = n.UserRole,
                Type = n.Type,
                Status = n.Status,
                ScheduledAt = n.ScheduledAt,
                SentAt = n.SentAt,
                CreatedBy = n.CreatedBy,
                CreatedByUsername = n.Creator != null ? n.Creator.Username : null,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
