using EbayClone.Infrastructure.Identity;

namespace EbayClone.Web.Services;

public interface IJwtTokenService
{
    Task<string> GenerateTokenAsync(ApplicationUser user, IList<string> roles, CancellationToken cancellationToken = default);
}
