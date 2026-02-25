using EbayClone.Application.Common.Interfaces;
using EbayClone.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.AdminRoles.Queries.GetAdminUsers;

public record GetAdminUsersQuery : IRequest<PaginatedList<AdminUserRoleDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public int? RoleId { get; init; }
    public string? Search { get; init; }
}

public class GetAdminUsersQueryHandler : IRequestHandler<GetAdminUsersQuery, PaginatedList<AdminUserRoleDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<AdminUserRoleDto>> Handle(GetAdminUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AdminUserRoles
            .Include(aur => aur.User)
            .Include(aur => aur.Role)
            .Include(aur => aur.Assigner)
            .AsQueryable();

        // Filter by role
        if (request.RoleId.HasValue)
        {
            query = query.Where(aur => aur.RoleId == request.RoleId.Value);
        }

        // Search by username or email
        if (!string.IsNullOrEmpty(request.Search))
        {
            var searchLower = request.Search.ToLower();
            query = query.Where(aur =>
                (aur.User != null && aur.User.Username != null && aur.User.Username.ToLower().Contains(searchLower)) ||
                (aur.User != null && aur.User.Email != null && aur.User.Email.ToLower().Contains(searchLower)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(aur => aur.AssignedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(aur => new AdminUserRoleDto
            {
                Id = aur.Id,
                UserId = aur.UserId,
                Username = aur.User != null ? aur.User.Username : null,
                Email = aur.User != null ? aur.User.Email : null,
                RoleId = aur.RoleId,
                RoleName = aur.Role != null ? aur.Role.RoleName : "",
                AssignedBy = aur.AssignedBy,
                AssignedByUsername = aur.Assigner != null ? aur.Assigner.Username : null,
                AssignedAt = aur.AssignedAt
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<AdminUserRoleDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
