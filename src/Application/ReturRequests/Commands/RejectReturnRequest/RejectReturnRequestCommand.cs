using EbayClone.Application.Common.Exceptions;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.ReturRequests.Commands.RejectReturnRequest;
public record RejectReturnRequestCommand(int ReturnRequestId, string? AdminNote)
    : IRequest<Unit>;

public class RejectReturnRequestCommandHandler
    : IRequestHandler<RejectReturnRequestCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationNotifier _notifier;

    public RejectReturnRequestCommandHandler(IApplicationDbContext context, INotificationNotifier notifier)
    {
        _context = context;
        _notifier = notifier;
    }

    public async Task<Unit> Handle(
        RejectReturnRequestCommand request,
        CancellationToken cancellationToken)
    {
        var returnRequest = await _context.ReturnRequests
            .FirstOrDefaultAsync(r => r.Id == request.ReturnRequestId, cancellationToken);

        if (returnRequest == null)
            throw new NotFoundException(nameof(ReturnRequest), $"{request.ReturnRequestId}");

        if (returnRequest.Status != "Pending")
            throw new InvalidOperationException(
                $"Yêu cầu hoàn trả #{request.ReturnRequestId} đã được xử lý trước đó (Status: {returnRequest.Status}).");

        returnRequest.Status = "Rejected";
        returnRequest.AdminNote = request.AdminNote;
        returnRequest.ResolvedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        
        // Broadcast update
        await _notifier.NotifyReturnRequestUpdatedAsync(returnRequest.Id, returnRequest.Status, cancellationToken);
        
        return Unit.Value;
    }
}
