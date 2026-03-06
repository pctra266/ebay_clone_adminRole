using EbayClone.Application.ReturRequests.Commands.ApproveReturnRequest;
using EbayClone.Application.ReturRequests.Commands.RejectReturnRequest;
using EbayClone.Application.ReturRequests.Queries.GetReturnRequestDetail;
using EbayClone.Application.ReturRequests.Queries.GetReturnRequests;

namespace EbayClone.Web.Endpoints;

public class AdminReturnRequests : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group)
    {
        // GET /api/adminreturnrequests?status=Pending  → Bước 1: Danh sách chờ xử lý
        group.MapGet(GetReturnRequests);

        // GET /api/adminreturnrequests/{id}           → Bước 3: Chi tiết yêu cầu
        group.MapGet("{id}", GetReturnRequestDetail);

        // POST /api/adminreturnrequests/{id}/approve  → Bước 4: Chấp nhận hoàn tiền
        group.MapPost("{id}/approve", ApproveReturnRequest);

        // POST /api/adminreturnrequests/{id}/reject   → Bước 4: Từ chối hoàn tiền
        group.MapPost("{id}/reject", RejectReturnRequest);
    }

    // Bước 1: Danh sách — dùng [AsParameters] để map query string ?status=Pending
    public async Task<List<ReturnRequestListItemDto>> GetReturnRequests(
        ISender sender,
        [AsParameters] GetReturnRequestsQuery query)
    {
        return await sender.Send(query);
    }

    // Bước 3: Chi tiết một yêu cầu hoàn trả
    public async Task<ReturnRequestDetailDto> GetReturnRequestDetail(ISender sender, int id)
    {
        return await sender.Send(new GetReturnRequestDetailQuery(id));
    }

    // Bước 4: Chấp nhận hoàn tiền
    public async Task<IResult> ApproveReturnRequest(
        ISender sender,
        int id,
        ApproveReturnRequestCommand command)
    {
        if (id != command.ReturnRequestId) return Results.BadRequest();
        await sender.Send(command);
        return Results.NoContent();
    }

    // Bước 4: Từ chối hoàn tiền
    public async Task<IResult> RejectReturnRequest(
        ISender sender,
        int id,
        RejectReturnRequestCommand command)
    {
        if (id != command.ReturnRequestId) return Results.BadRequest();
        await sender.Send(command);
        return Results.NoContent();
    }
}
