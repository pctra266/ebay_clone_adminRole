using EbayClone.Application.Broadcasts;
using EbayClone.Application.Broadcasts.Commands.SendBroadcast;
using EbayClone.Application.Broadcasts.Queries.GetBroadcasts;
using EbayClone.Application.Common.Models;
using EbayClone.Web.Infrastructure;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace EbayClone.Web.Endpoints;

public class Broadcasts : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        // Only authorized admins can access broadcasts
        groupBuilder.RequireAuthorization();

        groupBuilder.MapGet("", GetBroadcasts);
        groupBuilder.MapPost("", SendBroadcast);
        groupBuilder.MapPost("schedule", ScheduleBroadcast);
    }

    public async Task<Ok<PaginatedList<BroadcastDto>>> GetBroadcasts(
        ISender sender,
        [AsParameters] GetBroadcastsQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Created<int>> SendBroadcast(
        ISender sender,
        [FromBody] SendBroadcastRequest request)
    {
        var count = await sender.Send(new SendBroadcastCommand
        {
            Title = request.Title,
            Content = request.Content,
            TargetAudience = request.TargetAudience,
            Channels = request.Channels,
            ScheduleAt = null, // Send immediately
            CreatedBy = request.CreatedBy
        });

        return TypedResults.Created($"/api/Broadcasts", count);
    }

    public async Task<Created<int>> ScheduleBroadcast(
        ISender sender,
        [FromBody] ScheduleBroadcastRequest request)
    {
        var count = await sender.Send(new SendBroadcastCommand
        {
            Title = request.Title,
            Content = request.Content,
            TargetAudience = request.TargetAudience,
            Channels = request.Channels,
            ScheduleAt = request.ScheduleAt,
            CreatedBy = request.CreatedBy
        });

        return TypedResults.Created($"/api/Broadcasts", count);
    }
}

// Request DTOs
public record SendBroadcastRequest(
    string Title,
    string Content,
    string TargetAudience,
    List<string> Channels,
    int CreatedBy);

public record ScheduleBroadcastRequest(
    string Title,
    string Content,
    string TargetAudience,
    List<string> Channels,
    DateTime ScheduleAt,
    int CreatedBy);
