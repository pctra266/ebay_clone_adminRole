using System;
using System.Threading;
using System.Threading.Tasks;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.ReturRequests.Commands.ProcessReturnLabel;

public record ProcessReturnLabelCommand(int ReturnRequestId, string ReturnLabelUrl) : IRequest<Unit>;

public class ProcessReturnLabelCommandHandler : IRequestHandler<ProcessReturnLabelCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public ProcessReturnLabelCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(ProcessReturnLabelCommand request, CancellationToken cancellationToken)
    {
        var returnRequest = await _context.ReturnRequests
            .FirstOrDefaultAsync(r => r.Id == request.ReturnRequestId, cancellationToken);

        if (returnRequest == null)
            throw new NotFoundException(nameof(ReturnRequest), $"{request.ReturnRequestId}");

        if (returnRequest.Status != "WaitingForReturnLabel")
            throw new InvalidOperationException($"Yêu cầu này không ở trạng thái chờ mã vận đơn (Status: {returnRequest.Status}).");

        returnRequest.ReturnLabelUrl = request.ReturnLabelUrl;
        returnRequest.Status = "ReturnLabelProvided";

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
