using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;

namespace EbayClone.Application.Authentication.Commands.Login;

public class LoginCommandHandler
    : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                x => x.Email == request.Email,
                cancellationToken);

        if (user == null)
            throw new UnauthorizedAccessException("Invalid credentials");

        // Verify password (BCrypt)
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            throw new UnauthorizedAccessException("Invalid credentials");

        // Check 2FA
        if (user.TwoFactorEnabled)
        {
            return new LoginResponse
            {
                RequireTwoFactor = true,
                UserId = user.Id
            };
        }

        // Generate JWT
        var token = _jwtService.GenerateToken(user);

        return new LoginResponse
        {
            Token = token,
            RequireTwoFactor = false,
            UserId = user.Id
        };
    }
}
