using EbayClone.Application.Common.Interfaces;
using EbayClone.Application.Payouts.Commands.RunPayoutEngine;
using EbayClone.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EbayClone.Application.Sellers.Commands.PushPayout;

public record PushPayoutCommand : IRequest<PayoutEngineResult>
{
    public int SellerId { get; init; }
    public decimal Amount { get; init; }
}

public class PushPayoutCommandHandler : IRequestHandler<PushPayoutCommand, PayoutEngineResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ISender _sender;

    public PushPayoutCommandHandler(IApplicationDbContext context, ISender sender)
    {
        _context = context;
        _sender = sender;
    }

    public async Task<PayoutEngineResult> Handle(PushPayoutCommand request, CancellationToken cancellationToken)
    {
        var seller = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.SellerId, cancellationToken);

        if (seller == null)
            throw new ArgumentException($"Seller with ID '{request.SellerId}' not found.");

        // 1. Ensure Bank Account is linked
        if (string.IsNullOrEmpty(seller.BankAccountMock))
        {
            seller.BankAccountMock = "{\"bankName\": \"Manual Test Bank\", \"accountNumber\": \"TEST-999\", \"accountName\": \"" + seller.Username + "\"}";
        }

        // 2. Inject Available Balance
        var wallet = await _context.SellerWallets.FirstOrDefaultAsync(w => w.SellerId == seller.Id, cancellationToken);
        if (wallet == null)
        {
            wallet = new SellerWallet { SellerId = seller.Id, AvailableBalance = 0, PendingBalance = 0, LockedBalance = 0 };
            _context.SellerWallets.Add(wallet);
        }

        wallet.AvailableBalance += request.Amount;
        
        // Audit injection
        _context.FinancialTransactions.Add(new FinancialTransaction
        {
            SellerId = seller.Id,
            UserId = seller.Id,
            Type = "Adjustment",
            Amount = request.Amount,
            BalanceAfter = wallet.AvailableBalance,
            Description = $"[MockPush] Injected ${request.Amount:F2} for manual payout test.",
            Date = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        // 3. Trigger targeted Payout Engine run
        return await _sender.Send(new RunPayoutEngineCommand { SellerId = seller.Id }, cancellationToken);
    }
}
