using EbayClone.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using EbayClone.Domain.Entities;

namespace EbayClone.Application.Users.Commands.ApproveUser;

public record ApproveUserCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public int AdminId { get; init; }
}

public class ApproveUserCommandHandler : IRequestHandler<ApproveUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ApproveUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ApproveUserCommand request, CancellationToken cancellationToken)
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
            user.ApprovedBy,
            user.ApprovedAt
        };

        user.ApprovalStatus = "Approved";
        user.ApprovedBy = request.AdminId;
        user.ApprovedAt = DateTime.UtcNow;
        user.Status = "Active";

        var after = new
        {
            user.Status,
            user.ApprovalStatus,
            user.ApprovedBy,
            user.ApprovedAt
        };

        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Tai khoan da duoc phe duyet",
            Content = "Chuc mung! Tai khoan cua ban da duoc phe duyet.",
            Type = "InApp",
            Status = "Sent",
            SentAt = DateTime.UtcNow,
            CreatedBy = request.AdminId,
            CreatedAt = DateTime.UtcNow
        });

        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Thong bao phe duyet tai khoan",
            Content = "Tai khoan cua ban da duoc phe duyet.",
            Type = "Email",
            Status = "Pending",
            CreatedBy = request.AdminId,
            CreatedAt = DateTime.UtcNow
        });

        _context.AdminActions.Add(new AdminAction
        {
            AdminId = request.AdminId,
            Action = "ApproveUser",
            TargetType = "User",
            TargetId = user.Id,
            Details = JsonSerializer.Serialize(new { before, after }),
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
