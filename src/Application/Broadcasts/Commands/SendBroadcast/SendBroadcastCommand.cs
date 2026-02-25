using EbayClone.Application.Common.Interfaces;
using EbayClone.Infrastructure;

namespace EbayClone.Application.Broadcasts.Commands.SendBroadcast;

public record SendBroadcastCommand : IRequest<int>
{
    public string Title { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string TargetAudience { get; init; } = "All"; // All, Seller, Buyer
    public List<string> Channels { get; init; } = new() { "InApp" }; // Email, InApp, SMS
    public DateTime? ScheduleAt { get; init; }
    public int CreatedBy { get; init; }
}

public class SendBroadcastCommandHandler : IRequestHandler<SendBroadcastCommand, int>
{
    private readonly IApplicationDbContext _context;

    public SendBroadcastCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(SendBroadcastCommand request, CancellationToken cancellationToken)
    {
        // Create notification for each channel
        foreach (var channel in request.Channels)
        {
            var notification = new Notification
            {
                UserId = null, // Broadcast to all matching users
                UserRole = request.TargetAudience == "All" ? null : request.TargetAudience,
                Title = request.Title,
                Content = request.Content,
                Type = channel,
                Status = request.ScheduleAt.HasValue ? "Scheduled" : "Pending",
                ScheduledAt = request.ScheduleAt,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // TODO: Trigger email/SMS sending service if not scheduled
        // If not scheduled, mark as Sent immediately (for InApp)
        // Email/SMS would be handled by a background service

        return request.Channels.Count; // Return number of notifications created
    }
}
