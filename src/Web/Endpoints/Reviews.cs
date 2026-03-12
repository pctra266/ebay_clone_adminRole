using EbayClone.Application.Reviews;
using EbayClone.Application.Reviews.Commands;
using EbayClone.Application.Reviews.Queries;
using EbayClone.Web.Infrastructure;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace EbayClone.Web.Endpoints;

public class Reviews : EndpointGroupBase
{
    public override string GroupName => "reviews";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetFlaggedReviews, "flagged");
        groupBuilder.MapPut(UpdateReviewStatus, "{id:int}/status");
        groupBuilder.MapPost(CreateReview);
    }

    public async Task<Ok<int>> CreateReview(ISender sender, [FromBody] CreateReviewCommand command)
    {
        var result = await sender.Send(command);
        return TypedResults.Ok(result);
    }

    public async Task<Ok<List<ReviewModerationDto>>> GetFlaggedReviews(ISender sender)
    {
        var result = await sender.Send(new GetFlaggedReviewsQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok, NotFound>> UpdateReviewStatus(
        ISender sender,
        int id,
        [FromBody] UpdateReviewStatusRequest request)
    {
        var result = await sender.Send(new UpdateReviewStatusCommand
        {
            Id = id,
            Status = request.Status,
            Action = request.Action,
            AdminId = request.AdminId
        });

        if (!result) return TypedResults.NotFound();

        return TypedResults.Ok();
    }
}

public record UpdateReviewStatusRequest(string Status, string Action, int AdminId);
