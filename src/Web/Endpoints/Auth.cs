using EbayClone.Infrastructure.Identity;
using EbayClone.Web.Options;
using EbayClone.Web.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using EbayClone.Infrastructure.Security;

namespace EbayClone.Web.Endpoints;

public class Auth : EndpointGroupBase
{
    public override string GroupName => "Auth";

    public override void Map(RouteGroupBuilder group)
    {
        group.MapPost(Login, "login")
             .AllowAnonymous();
    }

    public async Task<LoginResponse> Login(
    LoginRequest request,
    HttpContext httpContext,
    UserManager<ApplicationUser> userManager,
    IJwtTokenService jwtTokenService,
    IOptions<JwtSettings> jwtSettings,
    IOptions<SecuritySettings> securitySettings,
    ILogger<Auth> logger,
    CancellationToken cancellationToken)
    {
        var ipAddress =
            httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
            ?? httpContext.Connection.RemoteIpAddress?.ToString();

        if (ipAddress is null ||
            !securitySettings.Value.AllowedIps.Contains(ipAddress))
        {
            logger.LogWarning("Blocked login from IP {IP}", ipAddress);
            throw new UnauthorizedAccessException("IP not allowed.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new BadHttpRequestException("Email is required.");

        var user = await userManager.FindByEmailAsync(request.Email);

        if (user is null)
        {
            logger.LogWarning("User not found {Email} from IP {IP}",
                request.Email, ipAddress);

            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var valid = await userManager.CheckPasswordAsync(user, request.Password);

        if (!valid)
        {
            logger.LogWarning("Wrong password for {Email} from IP {IP}",
                request.Email, ipAddress);

            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        logger.LogInformation("User {Email} logged in from {IP}",
            user.Email, ipAddress);

        var roles = await userManager.GetRolesAsync(user);
        var token = await jwtTokenService.GenerateTokenAsync(user, roles, cancellationToken);

        var expiresAt =
            DateTime.UtcNow.AddMinutes(jwtSettings.Value.ExpirationMinutes);

        return new LoginResponse(
            token,
            user.UserName ?? user.Email,
            user.Email,
            roles.ToList(),
            expiresAt
        );
    }   
}

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    string Token,
    string? UserName,
    string? Email,
    IList<string> Roles,
    DateTime ExpiresAt
);
