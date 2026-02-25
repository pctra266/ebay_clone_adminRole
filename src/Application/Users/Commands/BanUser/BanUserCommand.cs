using EbayClone.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Users.Commands.BanUser;

public record BanUserCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public int AdminId { get; init; }
}

public class BanUserCommandHandler : IRequestHandler<BanUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public BanUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(BanUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return false;
        }

        user.Status = "Banned";
        user.BannedReason = request.Reason;
        user.BannedBy = request.AdminId;
        user.BannedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
