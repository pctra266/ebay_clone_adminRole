using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OtpNet;
using EbayClone.Application.Common.Interfaces;

namespace EbayClone.Application.Authentication.Commands.Verify2FA
{
    public class Verify2FACommandHandler
        : IRequestHandler<Verify2FACommand, string>
    {
        private readonly IApplicationDbContext _context;
        private readonly IJwtService _jwtService;

        // ✅ Constructor injection (PHẦN BẠN ĐANG THIẾU)
        public Verify2FACommandHandler(
            IApplicationDbContext context,
            IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<string> Handle(
            Verify2FACommand request,
            CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);

            if (user == null || string.IsNullOrEmpty(user.TwoFactorSecret))
                throw new Exception("Invalid user");

            var totp = new Totp(Base32Encoding.ToBytes(user.TwoFactorSecret));

            if (!totp.VerifyTotp(request.Code, out long timeStepMatched))
                throw new Exception("Invalid 2FA code");

            // Nếu hợp lệ → tạo JWT
            return _jwtService.GenerateToken(user);
        }
    }
}
