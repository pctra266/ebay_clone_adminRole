using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using MediatR;

namespace EbayClone.Application.Reviews.Commands;

public record CreateReviewCommand : IRequest<int>
{
    public int ProductId { get; init; }
    public int ReviewerId { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
}

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IContentModerationService _moderationService;

    public CreateReviewCommandHandler(IApplicationDbContext context, IContentModerationService moderationService)
    {
        _context = context;
        _moderationService = moderationService;
    }

    public async Task<int> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var review = new Review
        {
            ProductId = request.ProductId,
            ReviewerId = request.ReviewerId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow,
            Status = "Visible",
            FlaggedBySystem = false
        };

        // 1. Logic gắn cờ dựa trên Rating
        if (request.Rating == 1)
        {
            review.FlaggedBySystem = true;
            review.FlagReason = "LowRating";
            review.Status = "PendingReview";
        }

        // 2. Logic gắn cờ dựa trên AI Content Moderation (Gemini)
        if (!string.IsNullOrEmpty(request.Comment))
        {
            var (isFlagged, reason) = await _moderationService.ModerateContentAsync(request.Comment, cancellationToken);
            
            if (isFlagged)
            {
                review.FlaggedBySystem = true;
                review.FlagReason = review.FlagReason == null ? reason : review.FlagReason + ", " + reason;
                review.Status = "PendingReview";
            }
        }

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);

        return review.Id;
    }
}
