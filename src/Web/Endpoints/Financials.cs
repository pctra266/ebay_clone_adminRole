using EbayClone.Application.PlatformFees.Commands.UpdatePlatformFees;
using EbayClone.Application.PlatformFees.Queries.GetPlatformFees;
using EbayClone.Application.Reports.Queries.GetRevenueReport;
using EbayClone.Application.Withdrawals.Commands.ApproveWithdrawal;
using EbayClone.Application.Withdrawals.Commands.RejectWithdrawal;
using EbayClone.Application.Withdrawals.Commands.RequestWithdrawal;
using EbayClone.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using EbayClone.Web.Infrastructure;

namespace EbayClone.Web.Endpoints;

public class Financials : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group)
    {
        group.RequireAuthorization();

        // Fees
        group.MapGet("fees", GetFees)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));
             
        group.MapPut("fees", UpdateFees)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));

        // Withdrawals
        group.MapPost("withdrawals/request", RequestWithdrawal);
        
        group.MapPost("withdrawals/{id}/approve", ApproveWithdrawal)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));
             
        group.MapPost("withdrawals/{id}/reject", RejectWithdrawal)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));

        // Reports
        group.MapGet("reports/revenue", GetRevenueReport)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));
    }

    public async Task<PlatformFeesDto> GetFees(ISender sender)
    {
        return await sender.Send(new GetPlatformFeesQuery());
    }

    public async Task<int> UpdateFees(ISender sender, UpdatePlatformFeesCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<int> RequestWithdrawal(ISender sender, RequestWithdrawalCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> ApproveWithdrawal(ISender sender, int id, [FromBody] string transactionId)
    {
        await sender.Send(new ApproveWithdrawalCommand(id, transactionId));
        return Results.NoContent();
    }

    public async Task<IResult> RejectWithdrawal(ISender sender, int id, [FromBody] string reason)
    {
        await sender.Send(new RejectWithdrawalCommand(id, reason));
        return Results.NoContent();
    }

    public async Task<RevenueReportDto> GetRevenueReport(ISender sender)
    {
        return await sender.Send(new GetRevenueReportQuery());
    }
}
