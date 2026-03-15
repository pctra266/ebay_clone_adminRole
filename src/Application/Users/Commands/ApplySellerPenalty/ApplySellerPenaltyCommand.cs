using System;
using System.Threading;
using System.Threading.Tasks;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Users.Commands.ApplySellerPenalty;

public record ApplySellerPenaltyCommand(int UserId, int MarksToDeduct, string Reason) : IRequest<Unit>;

public class ApplySellerPenaltyCommandHandler : IRequestHandler<ApplySellerPenaltyCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public ApplySellerPenaltyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(ApplySellerPenaltyCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
            throw new NotFoundException(nameof(User), $"{request.UserId}");

        // Deduct performance score
        user.PerformanceScore -= request.MarksToDeduct;
        user.ViolationCount += 1; // Increase violation count

        if (user.PerformanceScore <= 0)
        {
            user.PerformanceScore = 0;
            // Ban the user if score falls below 0
            if (user.Status != "Banned")
            {
                user.Status = "Banned";
                user.BannedReason = $"Hiệu suất bán hàng quá thấp do bị trừ điểm: {request.Reason}";
                user.BannedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
