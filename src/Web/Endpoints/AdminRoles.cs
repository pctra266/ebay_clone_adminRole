using EbayClone.Application.AdminRoles;
using EbayClone.Application.AdminRoles.Commands.AssignRole;
using EbayClone.Application.AdminRoles.Commands.CreateAdminRole;
using EbayClone.Application.AdminRoles.Queries.GetAdminRoles;
using EbayClone.Application.AdminRoles.Queries.GetAdminUsers;
using EbayClone.Application.Common.Models;
using EbayClone.Web.Infrastructure;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace EbayClone.Web.Endpoints;

public class AdminRoles : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        // Only SuperAdmin can access these endpoints
        groupBuilder.RequireAuthorization();

        // Roles management
        groupBuilder.MapGet("roles", GetRoles);
        groupBuilder.MapPost("roles", CreateRole);

        // Admin users management
        groupBuilder.MapGet("users", GetAdminUsers);
        groupBuilder.MapPost("users/assign", AssignRole);
    }

    public async Task<Ok<List<AdminRoleDto>>> GetRoles(ISender sender)
    {
        var result = await sender.Send(new GetAdminRolesQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Created<int>> CreateRole(
        ISender sender,
        [FromBody] CreateRoleRequest request)
    {
        var roleId = await sender.Send(new CreateAdminRoleCommand
        {
            RoleName = request.RoleName,
            Description = request.Description,
            Permissions = request.Permissions
        });

        return TypedResults.Created($"/api/AdminRoles/roles/{roleId}", roleId);
    }

    public async Task<Ok<PaginatedList<AdminUserRoleDto>>> GetAdminUsers(
        ISender sender,
        [AsParameters] GetAdminUsersQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok, NotFound>> AssignRole(
        ISender sender,
        [FromBody] AssignRoleRequest request)
    {
        var result = await sender.Send(new AssignRoleCommand
        {
            UserId = request.UserId,
            RoleId = request.RoleId,
            AssignedBy = request.AssignedBy
        });

        if (!result)
            return TypedResults.NotFound();

        return TypedResults.Ok();
    }
}

// Request DTOs
public record CreateRoleRequest(string RoleName, string? Description, List<string> Permissions);
public record AssignRoleRequest(int UserId, int RoleId, int AssignedBy);
