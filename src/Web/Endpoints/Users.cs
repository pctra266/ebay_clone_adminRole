using EbayClone.Application.Common.Models;
using EbayClone.Application.Users;
using EbayClone.Application.Users.Commands.ApproveUser;
using EbayClone.Application.Users.Commands.BanUser;
using EbayClone.Application.Users.Commands.UnbanUser;
using EbayClone.Application.Users.Queries.GetUserById;
using EbayClone.Application.Users.Queries.GetUsers;
using EbayClone.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace EbayClone.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));

        group.MapGet("", GetUsers);
        group.MapGet("{id:int}", GetUserById);
        group.MapPost("{id:int}/approve", ApproveUser);
        group.MapPost("{id:int}/ban", BanUser);
        group.MapPost("{id:int}/unban", UnbanUser);
    }

    public async Task<Ok<PaginatedList<UserBriefDto>>> GetUsers(
        ISender sender,
        [AsParameters] GetUsersQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Results<Ok<UserDto>, NotFound>> GetUserById(
        ISender sender,
        int id)
    {
        var result = await sender.Send(new GetUserByIdQuery(id));
        return result == null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    public async Task<Results<Ok, NotFound>> ApproveUser(
        ISender sender,
        int id,
        [FromBody] ApproveUserRequest request)
    {
        var result = await sender.Send(new ApproveUserCommand
        {
            UserId = id,
            AdminId = request.AdminId
        });

        return result ? TypedResults.Ok() : TypedResults.NotFound();
    }

    public async Task<Results<Ok, NotFound>> BanUser(
        ISender sender,
        int id,
        [FromBody] BanUserRequest request)
    {
        var result = await sender.Send(new BanUserCommand
        {
            UserId = id,
            Reason = request.Reason,
            AdminId = request.AdminId
        });

        return result ? TypedResults.Ok() : TypedResults.NotFound();
    }

    public async Task<Results<Ok, NotFound>> UnbanUser(
        ISender sender,
        int id,
        [FromBody] UnbanUserRequest request)
    {
        var result = await sender.Send(new UnbanUserCommand
        {
            UserId = id,
            AdminId = request.AdminId
        });

        return result ? TypedResults.Ok() : TypedResults.NotFound();
    }
}

public record ApproveUserRequest(int AdminId);
public record BanUserRequest(string Reason, int AdminId);
public record UnbanUserRequest(int AdminId);

