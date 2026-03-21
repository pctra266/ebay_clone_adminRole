using EbayClone.Domain.Constants;
using EbayClone.Web.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using EbayClone.Application.Sellers.Commands.GenerateMockOrder;
using EbayClone.Application.Sellers.Commands.PushPayout;
using EbayClone.Application.Payouts.Commands.RunPayoutEngine;

namespace EbayClone.Web.Endpoints;

public class Mocking : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization(Policies.ManageUsers);
        group.MapPost("generate-seller-order", GenerateSellerOrder);
        group.MapPost("push-payout", PushPayout);
    }

    public async Task<IResult> GenerateSellerOrder(ISender sender, [FromBody] GenerateMockOrderCommand command)
    {
        try
        {
            var result = await sender.Send(command);
            return TypedResults.Ok(new { success = result, message = "Mock order generated." });
        }
        catch (ArgumentException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    public async Task<IResult> PushPayout(ISender sender, [FromBody] PushPayoutCommand command)
    {
        try
        {
            var result = await sender.Send(command);
            return TypedResults.Ok(result);
        }
        catch (ArgumentException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }
}
