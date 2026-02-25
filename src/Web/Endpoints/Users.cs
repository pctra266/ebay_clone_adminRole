using EbayClone.Application.Common.Models;
using EbayClone.Application.Users;
using EbayClone.Application.Users.Commands.ApproveUser;
using EbayClone.Application.Users.Commands.BanUser;
using EbayClone.Application.Users.Commands.RejectUser;
using EbayClone.Application.Users.Commands.UnbanUser;
using EbayClone.Application.Users.Commands.UpdateUserStatus;
using EbayClone.Application.Users.Queries.GetUserById;
using EbayClone.Application.Users.Queries.GetUsers;
using EbayClone.Web.Infrastructure;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace EbayClone.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        // TODO: Uncomment in production
        // groupBuilder.RequireAuthorization();

        groupBuilder.MapGet("", GetUsers);
        groupBuilder.MapGet("{id:int}", GetUserById);
        groupBuilder.MapPut("{id:int}/status", UpdateUserStatus);
        groupBuilder.MapPost("{id:int}/ban", BanUser);
        groupBuilder.MapPost("{id:int}/unban", UnbanUser);
        groupBuilder.MapPost("{id:int}/approve", ApproveUser);
        groupBuilder.MapPost("{id:int}/reject", RejectUser);
    }

    public async Task<Ok<PaginatedList<UserBriefDto>>> GetUsers(
        ISender sender,
        [AsParameters] GetUsersQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok<UserDto>, NotFound>> GetUserById(
        ISender sender,
        int id)
    {
        var result = await sender.Send(new GetUserByIdQuery(id));
        
        if (result == null)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok, NotFound, BadRequest<string>>> UpdateUserStatus(
        ISender sender,
        int id,
        [FromBody] UpdateUserStatusRequest request)
    {
        try
        {
            var result = await sender.Send(new UpdateUserStatusCommand
            {
                UserId = id,
                Status = request.Status
            });

            if (!result)
            {
                return TypedResults.NotFound();
            }

            return TypedResults.Ok();
        }
        catch (ArgumentException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
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

        if (!result)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok();
    }

    public async Task<Results<Ok, NotFound>> UnbanUser(
        ISender sender,
        int id)
    {
        var result = await sender.Send(new UnbanUserCommand(id));

        if (!result)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok();
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

        if (!result)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok();
    }

    public async Task<Results<Ok, NotFound>> RejectUser(
        ISender sender,
        int id,
        [FromBody] RejectUserRequest request)
    {
        var result = await sender.Send(new RejectUserCommand
        {
            UserId = id,
            Reason = request.Reason
        });

        if (!result)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok();
    }
}

// Request DTOs
public record UpdateUserStatusRequest(string Status);
public record BanUserRequest(string Reason, int AdminId);
public record ApproveUserRequest(int AdminId);
public record RejectUserRequest(string Reason);
