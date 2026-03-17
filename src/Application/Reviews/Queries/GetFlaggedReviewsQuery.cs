using EbayClone.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Reviews.Queries;

public record GetFlaggedReviewsQuery : IRequest<List<ReviewModerationDto>>;

public class GetFlaggedReviewsQueryHandler : IRequestHandler<GetFlaggedReviewsQuery, List<ReviewModerationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFlaggedReviewsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReviewModerationDto>> Handle(GetFlaggedReviewsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Reviews
            .AsNoTracking()
            .Where(r => r.FlaggedBySystem || r.Status == "PendingReview" || r.Status == "Hidden")
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewModerationDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductTitle = r.Product != null ? r.Product.Title : "Unknown Product",
                ReviewerId = r.ReviewerId,
                ReviewerName = r.Reviewer != null ? r.Reviewer.Username : "Unknown User",
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                Status = r.Status,
                FlaggedBySystem = r.FlaggedBySystem,
                FlagReason = r.FlagReason
            })
            .ToListAsync(cancellationToken);
    }
}
