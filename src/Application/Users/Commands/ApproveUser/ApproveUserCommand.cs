using EbayClone.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Users.Commands.ApproveUser;

public record ApproveUserCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public int AdminId { get; init; }
}

public class ApproveUserCommandHandler : IRequestHandler<ApproveUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ApproveUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ApproveUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return false;
        }

        user.ApprovalStatus = "Approved";
        user.ApprovedBy = request.AdminId;
        user.ApprovedAt = DateTime.UtcNow;
        user.Status = "Active";

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
