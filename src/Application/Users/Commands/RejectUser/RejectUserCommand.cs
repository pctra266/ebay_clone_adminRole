using EbayClone.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using EbayClone.Domain.Entities;

namespace EbayClone.Application.Users.Commands.RejectUser;

public record RejectUserCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public int AdminId { get; init; }
}

public class RejectUserCommandHandler : IRequestHandler<RejectUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public RejectUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(RejectUserCommand request, CancellationToken cancellationToken)
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
            user.BannedReason
        };

        user.ApprovalStatus = "Rejected";
        user.BannedReason = request.Reason; // Store rejection reason

        var after = new
        {
            user.Status,
            user.ApprovalStatus,
            user.BannedReason
        };

        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Tai khoan bi tu choi phe duyet",
            Content = $"Yeu cau dang ky cua ban bi tu choi. Ly do: {request.Reason}",
            Type = "InApp",
            Status = "Sent",
            SentAt = DateTime.UtcNow,
            CreatedBy = request.AdminId,
            CreatedAt = DateTime.UtcNow
        });

        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Thong bao tu choi phe duyet",
            Content = $"Yeu cau dang ky cua ban bi tu choi. Ly do: {request.Reason}",
            Type = "Email",
            Status = "Pending",
            CreatedBy = request.AdminId,
            CreatedAt = DateTime.UtcNow
        });

        _context.AdminActions.Add(new AdminAction
        {
            AdminId = request.AdminId,
            Action = "RejectUser",
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
