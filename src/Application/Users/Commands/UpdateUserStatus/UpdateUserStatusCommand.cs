using EbayClone.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using EbayClone.Domain.Entities;

namespace EbayClone.Application.Users.Commands.UpdateUserStatus;

public record UpdateUserStatusCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public string Status { get; init; } = "Active"; // Active, Pending, Suspended
    public int AdminId { get; init; }
}

public class UpdateUserStatusCommandHandler : IRequestHandler<UpdateUserStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return false;
        }

        // Validate status
        var validStatuses = new[] { "Active", "Pending", "Suspended" };
        if (!validStatuses.Contains(request.Status))
        {
            throw new ArgumentException($"Invalid status. Valid values: {string.Join(", ", validStatuses)}");
        }

        var before = new
        {
            user.Status,
            user.ApprovalStatus,
            user.BannedReason
        };

        user.Status = request.Status;

        var after = new
        {
            user.Status,
            user.ApprovalStatus,
            user.BannedReason
        };

        _context.AdminActions.Add(new AdminAction
        {
            AdminId = request.AdminId,
            Action = "UpdateUserStatus",
            TargetType = "User",
            TargetId = user.Id,
            Details = JsonSerializer.Serialize(new
            {
                before,
                after
            }),
            CreatedAt = DateTime.UtcNow
        });

        if (request.Status is "Suspended" or "Banned")
        {
            _context.Notifications.Add(new Notification
            {
                UserId = user.Id,
                Title = "Canh bao trang thai tai khoan",
                Content = $"Trang thai tai khoan cua ban da duoc cap nhat thanh: {request.Status}.",
                Type = "InApp",
                Status = "Sent",
                SentAt = DateTime.UtcNow,
                CreatedBy = request.AdminId,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
