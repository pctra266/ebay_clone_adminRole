using EbayClone.Application.Stats.Queries;
using EbayClone.Web.Infrastructure;
using Microsoft.AspNetCore.Http.HttpResults;

namespace EbayClone.Web.Endpoints;

public class Stats : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet("dashboard", GetDashboardStats);
    }

    public async Task<Ok<AdminDashboardStatsDto>> GetDashboardStats(ISender sender)
    {
        var result = await sender.Send(new GetAdminDashboardStatsQuery());
        return TypedResults.Ok(result);
    }
}
