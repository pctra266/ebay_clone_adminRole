using EbayClone.Application.Common.Interfaces;
using EbayClone.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EbayClone.Application.Users.Commands.BanUser;

public record BanUserCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public int AdminId { get; init; }
}

public class BanUserCommandHandler : IRequestHandler<BanUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public BanUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(BanUserCommand request, CancellationToken cancellationToken)
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

        user.Status = "Banned";
        user.BannedReason = request.Reason;
        user.BannedBy = request.AdminId;
        user.BannedAt = DateTime.UtcNow;

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
            Title = "Tai khoan bi khoa",
            Content = $"Tai khoan cua ban da bi khoa. Ly do: {request.Reason}",
            Type = "InApp",
            Status = "Sent",
            SentAt = DateTime.UtcNow,
            CreatedBy = request.AdminId,
            CreatedAt = DateTime.UtcNow
        });

        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Canh bao tai khoan",
            Content = $"Tai khoan cua ban da bi khoa. Ly do: {request.Reason}",
            Type = "Email",
            Status = "Pending",
            CreatedBy = request.AdminId,
            CreatedAt = DateTime.UtcNow
        });

        _context.AdminActions.Add(new AdminAction
        {
            AdminId = request.AdminId,
            Action = "BanUser",
            TargetType = "User",
            TargetId = user.Id,
            Details = JsonSerializer.Serialize(new
            {
                reason = request.Reason,
                before,
                after
            }),
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
