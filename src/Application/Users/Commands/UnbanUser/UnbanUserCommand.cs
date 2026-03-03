using EbayClone.Application.Common.Interfaces;
using EbayClone.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EbayClone.Application.Users.Commands.UnbanUser;

public record UnbanUserCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public int AdminId { get; init; }
}

public class UnbanUserCommandHandler : IRequestHandler<UnbanUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UnbanUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UnbanUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return false;
        }

        var before = new
        {
            user.Status,
            user.ApprovalStatus,
            user.BannedReason,
            user.BannedBy,
            user.BannedAt
        };

        user.Status = "Active";
        user.BannedReason = null;
        user.BannedBy = null;
        user.BannedAt = null;

        var after = new
        {
            user.Status,
            user.ApprovalStatus,
            user.BannedReason,
            user.BannedBy,
            user.BannedAt
        };

        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Tai khoan da duoc mo khoa",
            Content = "Tai khoan cua ban da duoc kich hoat lai.",
            Type = "InApp",
            Status = "Sent",
            SentAt = DateTime.UtcNow,
            CreatedBy = request.AdminId,
            CreatedAt = DateTime.UtcNow
        });

        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Thong bao mo khoa tai khoan",
            Content = "Tai khoan cua ban da duoc kich hoat lai.",
            Type = "Email",
            Status = "Pending",
            CreatedBy = request.AdminId,
            CreatedAt = DateTime.UtcNow
        });

        _context.AdminActions.Add(new AdminAction
        {
            AdminId = request.AdminId,
            Action = "UnbanUser",
            TargetType = "User",
            TargetId = user.Id,
            Details = JsonSerializer.Serialize(new { before, after }),
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
