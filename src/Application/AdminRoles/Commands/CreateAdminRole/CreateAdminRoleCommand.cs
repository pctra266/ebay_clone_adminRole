using EbayClone.Application.Common.Interfaces;
using EbayClone.Infrastructure;
using System.Text.Json;

namespace EbayClone.Application.AdminRoles.Commands.CreateAdminRole;

public record CreateAdminRoleCommand : IRequest<int>
{
    public string RoleName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public List<string> Permissions { get; init; } = new();
}

public class CreateAdminRoleCommandHandler : IRequestHandler<CreateAdminRoleCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateAdminRoleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateAdminRoleCommand request, CancellationToken cancellationToken)
    {
        var role = new AdminRole
        {
            RoleName = request.RoleName,
            Description = request.Description,
            Permissions = JsonSerializer.Serialize(request.Permissions),
            CreatedAt = DateTime.UtcNow
        };

        _context.AdminRoles.Add(role);
        await _context.SaveChangesAsync(cancellationToken);

        return role.Id;
    }
}
