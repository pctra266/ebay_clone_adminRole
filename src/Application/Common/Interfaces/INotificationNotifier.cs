namespace EbayClone.Application.Common.Interfaces;

public interface INotificationNotifier
{
    Task NotifyNewNotificationAsync(int notificationId, string title, string content, string? userRole, int? userId, CancellationToken cancellationToken = default);
}
