using EbayClone.Application.Common.Interfaces;
using EbayClone.Application.Common.Models;
using EbayClone.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Users.Queries.GetUsers;

public record GetUsersQuery : IRequest<PaginatedList<UserBriefDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Status { get; init; }
    public string? ApprovalStatus { get; init; }
    public string? Role { get; init; }
    public string? Search { get; init; }
    public string? OrderBy { get; init; } = "Id";
    public bool IsDescending { get; init; } = false;
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
        var query = _context.Users.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(request.Status))
        {
            query = query.Where(u => u.Status == request.Status);
        }

        if (!string.IsNullOrEmpty(request.ApprovalStatus))
        {
            query = query.Where(u => u.ApprovalStatus == request.ApprovalStatus);
        }

        if (!string.IsNullOrEmpty(request.Role))
        {
            query = query.Where(u => u.Role == request.Role);
        }

        if (!string.IsNullOrEmpty(request.Search))
        {
            var searchLower = request.Search.ToLower();
            query = query.Where(u => 
                (u.Username != null && u.Username.ToLower().Contains(searchLower)) ||
                (u.Email != null && u.Email.ToLower().Contains(searchLower)));
        }

        // Apply ordering
        query = request.OrderBy?.ToLower() switch
        {
            "username" => request.IsDescending ? query.OrderByDescending(u => u.Username) : query.OrderBy(u => u.Username),
            "email" => request.IsDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "status" => request.IsDescending ? query.OrderByDescending(u => u.Status) : query.OrderBy(u => u.Status),
            "lastloginat" => request.IsDescending ? query.OrderByDescending(u => u.LastLoginAt) : query.OrderBy(u => u.LastLoginAt),
            _ => request.IsDescending ? query.OrderByDescending(u => u.Id) : query.OrderBy(u => u.Id)
        };

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => u.ToBriefDto())
            .ToListAsync(cancellationToken);

        return new PaginatedList<UserBriefDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
