using EbayClone.Application.Common.Interfaces;
using EbayClone.Application.Common.Models;
using EbayClone.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Users.Queries.GetUsers;

public record GetUsersQuery : IRequest<PaginatedList<UserBriefDto>>
{
    public string Tab { get; init; } = "All"; // All | PendingApproval | Banned
    public string? Search { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, PaginatedList<UserBriefDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<UserBriefDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        IQueryable<User> query = _context.Users.AsNoTracking();

        query = request.Tab.Trim().ToLowerInvariant() switch
        {
            "pendingapproval" or "pending" => query.Where(u => u.ApprovalStatus == "PendingApproval" || u.Status == "Pending"),
            "banned" => query.Where(u => u.Status == "Banned"),
            _ => query
        };

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLowerInvariant();
            query = query.Where(u =>
                (u.Username != null && u.Username.ToLower().Contains(term)) ||
                (u.Email != null && u.Email.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(u => u.Id)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => u.ToBriefDto())
            .ToListAsync(cancellationToken);

        return new PaginatedList<UserBriefDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}

