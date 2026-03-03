using EbayClone.Application.Authentication.Commands.Login;
using EbayClone.Application.Authentication.Commands.Verify2FA;

namespace EbayClone.Web.Endpoints;

public class Auth : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder group)
    {
        // Route gốc sẽ là: /api/auth

        group.MapPost("login", Login);           // POST /api/auth/login
        group.MapPost("verify-2fa", Verify2FA);  // POST /api/auth/verify-2fa
    }

    public async Task<IResult> Login(ISender sender, LoginCommand command)
    {
        var result = await sender.Send(command);
        return Results.Ok(result);
    }

    public async Task<IResult> Verify2FA(ISender sender, Verify2FACommand command)
    {
        var token = await sender.Send(command);
        return Results.Ok(new { token });
    }

}
