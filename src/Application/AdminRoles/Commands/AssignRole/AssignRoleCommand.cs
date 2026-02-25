using EbayClone.Application.Common.Interfaces;
using EbayClone.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.AdminRoles.Commands.AssignRole;

public record AssignRoleCommand : IRequest<bool>
{
    public int UserId { get; init; }
    public int RoleId { get; init; }
    public int AssignedBy { get; init; }
}

public class AssignRoleCommandHandler : IRequestHandler<AssignRoleCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AssignRoleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AssignRoleCommand request, CancellationToken cancellationToken)
    {
        // Check if user exists
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null)
            return false;

        // Check if role exists
        var role = await _context.AdminRoles.FindAsync(new object[] { request.RoleId }, cancellationToken);
        if (role == null)
            return false;

        // Check if assignment already exists
        var existingAssignment = await _context.AdminUserRoles
            .FirstOrDefaultAsync(aur => aur.UserId == request.UserId, cancellationToken);

        if (existingAssignment != null)
        {
            // Update existing assignment
            existingAssignment.RoleId = request.RoleId;
            existingAssignment.AssignedBy = request.AssignedBy;
            existingAssignment.AssignedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new assignment
            var assignment = new AdminUserRole
            {
                UserId = request.UserId,
                RoleId = request.RoleId,
                AssignedBy = request.AssignedBy,
                AssignedAt = DateTime.UtcNow
            };
            _context.AdminUserRoles.Add(assignment);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
