using EbayClone.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Reviews.Commands;

public record UpdateReviewStatusCommand : IRequest<bool>
{
    public int Id { get; init; }
    public string Status { get; init; } = null!; // 'Visible', 'Hidden'
    public string Action { get; init; } = null!; // 'Keep', 'Hide'
    public int AdminId { get; init; }
}

public class UpdateReviewStatusCommandHandler : IRequestHandler<UpdateReviewStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateReviewStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateReviewStatusCommand request, CancellationToken cancellationToken)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (review == null) return false;

        review.Status = request.Status;
        review.ModerationAction = request.Action;
        review.ModeratedBy = request.AdminId;
        review.ModeratedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
