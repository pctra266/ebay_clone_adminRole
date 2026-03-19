using EbayClone.Application.Common.Models;
using EbayClone.Application.Users;
using EbayClone.Application.Users.Commands.ApproveUser;
using EbayClone.Application.Users.Commands.BanUser;
using EbayClone.Application.Users.Commands.RejectUser;
using EbayClone.Application.Users.Commands.UnbanUser;
using EbayClone.Application.Users.Commands.UpdateUserStatus;
using EbayClone.Application.Users.Queries.GetUserById;
using EbayClone.Application.Users.Queries.GetUsers;
using EbayClone.Domain.Constants;
using EbayClone.Web.Infrastructure;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace EbayClone.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization(Policies.ManageUsers);

        group.MapGet("", GetUsers);
        group.MapGet("{id:int}", GetUserById);
        group.MapPut("{id:int}/status", UpdateUserStatus);
        group.MapPost("{id:int}/ban", BanUser);
        group.MapPost("{id:int}/unban", UnbanUser);
        group.MapPost("{id:int}/approve", ApproveUser);
        group.MapPost("{id:int}/reject", RejectUser);
        group.MapPost("evaluate-sellers", EvaluateSellers);
    }

    public async Task<Results<Ok<int>, BadRequest<string>>> EvaluateSellers(ISender sender)
    {
        try
        {
            var result = await sender.Send(new EbayClone.Application.Sellers.Commands.EvaluateSellerLevels.EvaluateSellerLevelsCommand());
            return TypedResults.Ok(result);
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
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
                Status = request.Status,
                AdminId = request.AdminId
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
        int id,
        [FromBody] UnbanUserRequest request)
    {
        var result = await sender.Send(new UnbanUserCommand
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
            Reason = request.Reason,
            AdminId = request.AdminId
        });

        if (!result)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok();
    }
}

// Request DTOs
public record UpdateUserStatusRequest(string Status, int AdminId);
public record BanUserRequest(string Reason, int AdminId);
public record UnbanUserRequest(int AdminId);
public record ApproveUserRequest(int AdminId);
public record RejectUserRequest(string Reason, int AdminId);
