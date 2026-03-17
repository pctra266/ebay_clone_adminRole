using EbayClone.Application.Authentication.Commands.Verify2FA;
using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using EbayClone.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using OtpNet;
using Shouldly;

namespace EbayClone.Application.UnitTests.Authentication;

public class Verify2FATests
{
    private ApplicationDbContext _context = null!;
    private Mock<IJwtService> _jwtMock = null!;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _jwtMock = new Mock<IJwtService>();
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }

    [Test]
    public async Task Handle_ValidCode_ShouldReturnToken()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP"; // Base32 secret
        var user = new User { Id = 1, TwoFactorSecret = secret };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var totp = new Totp(Base32Encoding.ToBytes(secret));
        var code = totp.ComputeTotp();

        _jwtMock.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("TestToken");

        var handler = new Verify2FACommandHandler(_context, _jwtMock.Object);
        var command = new Verify2FACommand(1, code);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.ShouldBe("TestToken");
    }

    [Test]
    public void Handle_InvalidCode_ShouldThrowException()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";
        var user = new User { Id = 2, TwoFactorSecret = secret };
        _context.Users.Add(user);
        _context.SaveChanges();

        var handler = new Verify2FACommandHandler(_context, _jwtMock.Object);
        var command = new Verify2FACommand(2, "000000");

        // Act & Assert
        Should.ThrowAsync<Exception>(() => handler.Handle(command, CancellationToken.None))
            .Result.Message.ShouldBe("Invalid 2FA code");
    }
}
