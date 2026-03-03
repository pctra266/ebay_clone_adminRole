using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using MediatR;

namespace EbayClone.Application.Withdrawals.Commands.ApproveWithdrawal;

public record ApproveWithdrawalCommand(int WithdrawalId, string TransactionId) : IRequest;

public class ApproveWithdrawalCommandHandler : IRequestHandler<ApproveWithdrawalCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public ApproveWithdrawalCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(ApproveWithdrawalCommand request, CancellationToken cancellationToken)
    {
        var withdrawal = await _context.WithdrawalRequests
            .Include(w => w.Seller)
            .FirstOrDefaultAsync(w => w.Id == request.WithdrawalId, cancellationToken);

        if (withdrawal == null) throw new KeyNotFoundException($"Withdrawal request {request.WithdrawalId} not found.");

        if (withdrawal.Status != WithdrawalRequest.StatusPending)
        {
            throw new InvalidOperationException("Only pending requests can be approved.");
        }

        // Update status
        withdrawal.Status = WithdrawalRequest.StatusApproved;
        withdrawal.ProcessedBy = int.Parse(_user.Id ?? "0"); // Admin ID
        withdrawal.ProcessedAt = DateTime.UtcNow;
        withdrawal.TransactionId = request.TransactionId;

        // Record Financial Transaction (Audit log)
        var transaction = new FinancialTransaction
        {
            SellerId = withdrawal.SellerId,
            Type = "Withdrawal",
            Amount = -withdrawal.Amount, // Negative since money left system
            Description = $"Withdrawal Approved: {request.TransactionId}",
            Date = DateTime.UtcNow
        };
        _context.FinancialTransactions.Add(transaction);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
