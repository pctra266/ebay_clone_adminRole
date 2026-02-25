using EbayClone.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Users.Commands.RejectUser;

public record RejectUserCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public class RejectUserCommandHandler : IRequestHandler<RejectUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public RejectUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(RejectUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return false;
        }

        user.ApprovalStatus = "Rejected";
        user.BannedReason = request.Reason; // Store rejection reason

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
