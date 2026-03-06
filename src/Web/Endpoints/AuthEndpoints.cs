using System.Security.Claims;
using EbayClone.Application.Authentication.Commands.Login;
using EbayClone.Application.Authentication.Commands.Verify2FA;

namespace EbayClone.Web.Endpoints;

public class Auth : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group)
    {
        group.MapPost("login", Login);
        group.MapPost("verify-2fa", Verify2FA);
        group.MapPost("logout", Logout);
        group.MapGet("me", Me).RequireAuthorization();
    }

    public async Task<IResult> Login(ISender sender, LoginCommand command, HttpContext http)
    {
        var result = await sender.Send(command);

        if (!result.Success)
            return Results.Ok(result);

        if (result.RequireTwoFactor)
            return Results.Ok(result); // chưa set cookie, chờ 2FA

        // ✅ Set HttpOnly cookie
        http.Response.Cookies.Append("auth_token", result.Token!, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        result.Token = null; // ❌ không trả token về body
        return Results.Ok(result);
    }

    public async Task<IResult> Verify2FA(ISender sender, Verify2FACommand command, HttpContext http)
    {
        var token = await sender.Send(command);

        // ✅ Set cookie sau khi 2FA thành công
        http.Response.Cookies.Append("auth_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Results.Ok(new { success = true });
    }

    public IResult Logout(HttpContext http)
    {
        http.Response.Cookies.Delete("auth_token");
        return Results.Ok();
    }

    public IResult Me(HttpContext http)
    {
        var email = http.User.FindFirst(ClaimTypes.Email)?.Value;
        var userId = http.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = http.User.FindFirst(ClaimTypes.Role)?.Value;

        return Results.Ok(new { email, userId, role });
    }
}
