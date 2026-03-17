using System;
using System.Collections.Generic;
using System.Text;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;

namespace EbayClone.Application.ReturRequests.Commands.ApproveReturnRequest;
public record ApproveReturnRequestCommand(
    int ReturnRequestId, 
    string? AdminNote,
    string? ResolutionAction = "KeepItem", // "RequireReturn", "KeepItem", "RefundWithoutReturn"
    bool IsRefundedByEbayFund = false)
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

        if (returnRequest.Status != "Pending" && returnRequest.Status != "Escalated")
            throw new InvalidOperationException(
                $"Yêu cầu hoàn trả #{request.ReturnRequestId} không ở trạng thái hợp lệ để approve (Status: {returnRequest.Status}).");

        // Cập nhật ReturnRequest
        returnRequest.AdminNote = request.AdminNote;
        returnRequest.ResolvedAt = DateTime.UtcNow;
        returnRequest.ResolutionAction = request.ResolutionAction;
        returnRequest.IsRefundedByEbayFund = request.IsRefundedByEbayFund;

        if (request.ResolutionAction == "RequireReturn")
        {
            returnRequest.Status = "WaitingForReturnLabel"; // Đợi nhãn trả hàng
        }
        else 
        {
            // "KeepItem" hoặc "RefundWithoutReturn" -> Hoàn tiền ngay lập tức
            returnRequest.Status = "Approved";

            // Cập nhật trạng thái đơn hàng liên quan
            if (returnRequest.Order != null)
            {
                returnRequest.Order.Status = "Refunded";
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
