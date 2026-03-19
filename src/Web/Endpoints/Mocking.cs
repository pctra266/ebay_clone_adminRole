using EbayClone.Domain.Constants;
using EbayClone.Web.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using EbayClone.Application.Sellers.Commands.GenerateMockOrder;

namespace EbayClone.Web.Endpoints;

public class Mocking : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization(Policies.ManageUsers);
        group.MapPost("generate-seller-order", GenerateSellerOrder);
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
}
