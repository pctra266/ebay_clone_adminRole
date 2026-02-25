using EbayClone.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Users.Commands.UpdateUserStatus;

public record UpdateUserStatusCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public string Status { get; init; } = "Active"; // Active, Pending, Suspended
}

public class UpdateUserStatusCommandHandler : IRequestHandler<UpdateUserStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return false;
        }

        // Validate status
        var validStatuses = new[] { "Active", "Pending", "Suspended" };
        if (!validStatuses.Contains(request.Status))
        {
            throw new ArgumentException($"Invalid status. Valid values: {string.Join(", ", validStatuses)}");
        }

        user.Status = request.Status;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
