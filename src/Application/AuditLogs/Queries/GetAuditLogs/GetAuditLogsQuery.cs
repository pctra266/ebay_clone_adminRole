using EbayClone.Application.Common.Interfaces;
using EbayClone.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.AuditLogs.Queries.GetAuditLogs;

public record GetAuditLogsQuery : IRequest<PaginatedList<AuditLogDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public int? AdminId { get; init; }
    public string? TargetType { get; init; }
    public string? Action { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, PaginatedList<AuditLogDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditLogsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AdminActions
            .Include(a => a.Admin)
            .AsQueryable();

        // Filter by admin
        if (request.AdminId.HasValue)
        {
            query = query.Where(a => a.AdminId == request.AdminId.Value);
        }

        // Filter by target type
        if (!string.IsNullOrEmpty(request.TargetType))
        {
            query = query.Where(a => a.TargetType == request.TargetType);
        }

        // Filter by action
        if (!string.IsNullOrEmpty(request.Action))
        {
            query = query.Where(a => a.Action.Contains(request.Action));
        }

        // Filter by date range
        if (request.FromDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= request.ToDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                AdminId = a.AdminId,
                AdminUsername = a.Admin != null ? a.Admin.Username : null,
                Action = a.Action,
                TargetType = a.TargetType,
                TargetId = a.TargetId,
                Details = a.Details,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<AuditLogDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
