using EbayClone.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Users.Commands.UnbanUser;

public record UnbanUserCommand(int UserId) : IRequest<bool>;

public class UnbanUserCommandHandler : IRequestHandler<UnbanUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UnbanUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UnbanUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return false;
        }

        user.Status = "Active";
        user.BannedReason = null;
        user.BannedBy = null;
        user.BannedAt = null;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
