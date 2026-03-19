using EbayClone.Application.PlatformFees.Commands.UpdatePlatformFees;
using EbayClone.Application.PlatformFees.Queries.GetPlatformFees;
using EbayClone.Application.Reports.Queries.GetRevenueReport;
using EbayClone.Application.Withdrawals.Commands.ApproveWithdrawal;
using EbayClone.Application.Financials.Commands.SettlePendingFunds;
using EbayClone.Application.Withdrawals.Queries.GetWithdrawalRequests;
using EbayClone.Application.Withdrawals.Commands.RejectWithdrawal;
using EbayClone.Application.Withdrawals.Commands.RequestWithdrawal;
using EbayClone.Application.Financials.Queries.GetPendingSettlementOrders;
using EbayClone.Application.Financials.Queries.GetSellerPendingFunds;
using EbayClone.Application.Financials.Commands.SettleOrder;
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
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.SuperAdmin));
             
        group.MapPut("fees", UpdateFees)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.SuperAdmin));

        // Withdrawals
        group.MapGet("withdrawals", GetRequests)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.SuperAdmin));
             
        group.MapPost("withdrawals/request", RequestWithdrawal);
        
        group.MapPost("withdrawals/{id}/approve", ApproveWithdrawal)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.SuperAdmin));
             
        group.MapPost("withdrawals/{id}/reject", RejectWithdrawal)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.SuperAdmin));

        // Maintenance/Settlement
        group.MapPost("trigger-settlement", TriggerSettlement);
        group.MapGet("settlement-orders", GetPendingSettlementOrders);
        group.MapPost("settle-order/{id}", SettleOrder)
             .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.SuperAdmin));

        group.MapGet("pending/{sellerId:int}", GetSellerPendingFunds);

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

    public async Task<IResult> ApproveWithdrawal(ISender sender, int id, ApproveWithdrawalRequest request)
    {
        await sender.Send(new ApproveWithdrawalCommand(id, request.TransactionId));
        return Results.NoContent();
    }

    public async Task<IResult> RejectWithdrawal(ISender sender, int id, RejectWithdrawalRequest request)
    {
        await sender.Send(new RejectWithdrawalCommand(id, request.Reason));
        return Results.NoContent();
    }

    public async Task<List<WithdrawalRequestDto>> GetRequests(ISender sender, [FromQuery] string? status)
    {
        return await sender.Send(new GetWithdrawalRequestsQuery(status));
    }

    public async Task<int> TriggerSettlement(ISender sender)
    {
        return await sender.Send(new SettlePendingFundsCommand());
    }

    public async Task<List<PendingSettlementOrderDto>> GetPendingSettlementOrders(ISender sender)
    {
        return await sender.Send(new GetPendingSettlementOrdersQuery());
    }

    public async Task<IResult> SettleOrder(ISender sender, int id)
    {
        var result = await sender.Send(new SettleOrderCommand(id));
        return result ? Results.Ok() : Results.BadRequest("Failed to settle order. Ensure it's delivered and past dispute window.");
    }

    public async Task<RevenueReportDto> GetRevenueReport(ISender sender)
    {
        return await sender.Send(new GetRevenueReportQuery());
    }

    public async Task<List<SellerPendingFundDto>> GetSellerPendingFunds(ISender sender, int sellerId)
    {
        return await sender.Send(new GetSellerPendingFundsQuery(sellerId));
    }
}

public record ApproveWithdrawalRequest(string TransactionId);
public record RejectWithdrawalRequest(string Reason);
