using System.Text.Json;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using Microsoft.EntityFrameworkCore;

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
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
        {
            return false;
        }

        var before = new
        {
            user.Status,
            user.BannedReason,
            user.BannedBy,
            user.BannedAt
        };

        user.Status = "Active";
        user.BannedReason = null;
        user.BannedBy = null;
        user.BannedAt = null;

        _context.AdminActions.Add(new AdminAction
        {
            AdminId = request.AdminId,
            Action = "UnbanUser",
            TargetType = "User",
            TargetId = user.Id,
            Details = JsonSerializer.Serialize(new
            {
                before,
                after = new
                {
                    user.Status,
                    user.BannedReason,
                    user.BannedBy,
                    user.BannedAt
                }
            }),
            CreatedAt = DateTime.UtcNow
        });

        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Account unblocked",
            Content = "Your account has been unblocked.",
            Type = "InApp",
            Status = "Sent",
            SentAt = DateTime.UtcNow,
            CreatedBy = request.AdminId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

