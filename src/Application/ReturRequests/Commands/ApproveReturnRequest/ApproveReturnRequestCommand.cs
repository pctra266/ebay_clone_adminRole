using System;
using System.Collections.Generic;
using System.Text;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;

namespace EbayClone.Application.ReturRequests.Commands.ApproveReturnRequest;
public record ApproveReturnRequestCommand(int ReturnRequestId, string? AdminNote)
    : IRequest<Unit>;

public class ApproveReturnRequestCommandHandler
    : IRequestHandler<ApproveReturnRequestCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public ApproveReturnRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(
        ApproveReturnRequestCommand request,
        CancellationToken cancellationToken)
    {
        var returnRequest = await _context.ReturnRequests
            .Include(r => r.Order)
            .FirstOrDefaultAsync(r => r.Id == request.ReturnRequestId, cancellationToken);

        if (returnRequest == null)
            throw new NotFoundException(nameof(ReturnRequest), $"{request.ReturnRequestId}");

        if (returnRequest.Status != "Pending")
            throw new InvalidOperationException(
                $"Yêu cầu hoàn trả #{request.ReturnRequestId} đã được xử lý trước đó (Status: {returnRequest.Status}).");

        // Cập nhật ReturnRequest
        returnRequest.Status = "Approved";
        returnRequest.AdminNote = request.AdminNote;
        returnRequest.ResolvedAt = DateTime.UtcNow;

        // Cập nhật trạng thái đơn hàng liên quan
        if (returnRequest.Order != null)
        {
            returnRequest.Order.Status = "Refunded";
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
