using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Constants;
using EbayClone.Domain.Entities;
using Ardalis.GuardClauses;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EbayClone.Application.Admin.Disputes.Commands.ResolveDispute;

public record ResolveDisputeCommand : IRequest<int>
{
    public int DisputeId { get; init; }
    public string Winner { get; init; } = string.Empty; // 'Buyer', 'Seller', 'Split'
    public decimal? RefundAmount { get; init; }
    public string AdminNotes { get; init; } = string.Empty;
    public bool RequireReturn { get; init; } = false;
    public bool AddSellerViolation { get; init; } = false;
    public bool SendNotifications { get; init; } = true;
}

public class ResolveDisputeCommandValidator : AbstractValidator<ResolveDisputeCommand>
{
    public ResolveDisputeCommandValidator()
    {
        RuleFor(v => v.DisputeId)
            .GreaterThan(0).WithMessage("Dispute ID is required.");

        RuleFor(v => v.Winner)
            .NotEmpty().WithMessage("Winner decision is required.")
            .Must(w => w == DisputeWinners.Buyer || w == DisputeWinners.Seller || w == DisputeWinners.Split)
            .WithMessage("Winner must be 'Buyer', 'Seller', or 'Split'.");

        RuleFor(v => v.RefundAmount)
            .GreaterThanOrEqualTo(0).When(v => v.RefundAmount.HasValue)
            .WithMessage("Refund amount cannot be negative.");

        RuleFor(v => v.RefundAmount)
            .NotNull().When(v => v.Winner == DisputeWinners.Buyer || v.Winner == DisputeWinners.Split)
            .WithMessage("Refund amount is required for Buyer or Split decisions.");

        RuleFor(v => v.AdminNotes)
            .NotEmpty().WithMessage("Admin notes are required.")
            .MinimumLength(50).WithMessage("Admin notes must be at least 50 characters.")
            .MaximumLength(2000).WithMessage("Admin notes cannot exceed 2000 characters.");
    }
}

public class ResolveDisputeCommandHandler : IRequestHandler<ResolveDisputeCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly ILogger<ResolveDisputeCommandHandler> _logger;

    public ResolveDisputeCommandHandler(
        IApplicationDbContext context,
        IUser currentUser,
        ILogger<ResolveDisputeCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<int> Handle(ResolveDisputeCommand request, CancellationToken cancellationToken)
    {
        // Get dispute with related data
        var dispute = await _context.Disputes
            .Include(d => d.Order)
                .ThenInclude(o => o!.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(d => d.RaisedByNavigation)
            .FirstOrDefaultAsync(d => d.Id == request.DisputeId, cancellationToken);

        Guard.Against.NotFound(request.DisputeId, dispute);

        // Validate dispute can be resolved
        if (dispute.Status == DisputeStatuses.Resolved || dispute.Status == DisputeStatuses.Closed)
        {
            throw new ValidationException("This dispute has already been resolved.");
        }

        // Get current admin ID
        var adminId = int.TryParse(_currentUser.Id, out var parsedId) ? parsedId : (int?)null;

        // Update dispute resolution
        dispute.Status = DisputeStatuses.Resolved;
        dispute.Winner = request.Winner;
        dispute.ResolvedBy = adminId;
        dispute.ResolvedAt = DateTime.UtcNow;
        dispute.AdminNotes = request.AdminNotes;
        dispute.RefundAmount = request.RefundAmount ?? 0;
        dispute.RefundMethod = "OriginalPayment";

        // Get seller ID from order
        var sellerId = dispute.Order?.OrderItems.FirstOrDefault()?.Product?.SellerId;

        // PROCESS BASED ON DECISION
        if (request.Winner == DisputeWinners.Buyer)
        {
            // Buyer wins - Full refund
            await ProcessBuyerWins(dispute, sellerId, request.AddSellerViolation, cancellationToken);
        }
        else if (request.Winner == DisputeWinners.Seller)
        {
            // Seller wins - No refund, release funds
            await ProcessSellerWins(dispute, sellerId, cancellationToken);
        }
        else if (request.Winner == DisputeWinners.Split)
        {
            // Split decision - Partial refund
            await ProcessSplitDecision(dispute, sellerId, request.RefundAmount!.Value, cancellationToken);
        }

        // Create system message
        var systemMessage = new DisputeMessage
        {
            DisputeId = dispute.Id,
            SenderId = adminId ?? 0,
            SenderType = SenderTypes.Admin,
            MessageType = MessageTypes.Note,
            Content = $"Case resolved by admin. Decision: {request.Winner}. {request.AdminNotes}",
            CreatedAt = DateTime.UtcNow,
            IsInternal = false
        };
        _context.DisputeMessages.Add(systemMessage);

        // Log admin action
        var adminAction = new AdminAction
        {
            AdminId = adminId ?? 0,
            Action = "ResolveDispute",
            TargetType = "Dispute",
            TargetId = dispute.Id,
            Details = $"Resolved dispute {dispute.CaseId} in favor of {request.Winner}. Refund: ${request.RefundAmount}",
            CreatedAt = DateTime.UtcNow
        };

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Dispute {CaseId} resolved by Admin {AdminId}. Winner: {Winner}, Refund: {Refund}",
            dispute.CaseId, adminId, request.Winner, request.RefundAmount);

        // TODO: Send notifications (email/SMS) - Phase 3
        if (request.SendNotifications)
        {
            // Placeholder for notification service
        }

        return dispute.Id;
    }

    private async Task ProcessBuyerWins(Dispute dispute, int? sellerId, bool addViolation, CancellationToken cancellationToken)
    {
        var refundAmount = dispute.Amount ?? 0;

        // Update order status
        if (dispute.Order != null)
        {
            dispute.Order.Status = "Refunded";
        }

        // Update seller wallet
        if (sellerId.HasValue)
        {
            var sellerWallet = await _context.SellerWallets
                .FirstOrDefaultAsync(w => w.SellerId == sellerId.Value, cancellationToken);

            if (sellerWallet != null)
            {
                // Move money: DisputedBalance ? Refunded
                sellerWallet.DisputedBalance -= refundAmount;
                sellerWallet.TotalRefunded += refundAmount;
                sellerWallet.UpdatedAt = DateTime.UtcNow;
            }

            // Add violation if requested
            if (addViolation)
            {
                var seller = await _context.Users.FindAsync(new object[] { sellerId.Value }, cancellationToken);
                if (seller != null)
                {
                    seller.ViolationCount++;
                }
            }
        }

        // Create refund transaction
        var refundTransaction = new FinancialTransaction
        {
            SellerId = dispute.RaisedBy ?? 0,
            Type = "Refund",
            Amount = refundAmount,
            Description = $"Refund for dispute {dispute.CaseId}",
            OrderId = dispute.OrderId,
            Date = DateTime.UtcNow
        };
        _context.FinancialTransactions.Add(refundTransaction);

        dispute.RefundProcessedAt = DateTime.UtcNow;
        dispute.RefundTransactionId = Guid.NewGuid().ToString(); // Simulated payment gateway ID
    }

    private async Task ProcessSellerWins(Dispute dispute, int? sellerId, CancellationToken cancellationToken)
    {
        // Seller wins - Release frozen funds back to available
        if (sellerId.HasValue)
        {
            var sellerWallet = await _context.SellerWallets
                .FirstOrDefaultAsync(w => w.SellerId == sellerId.Value, cancellationToken);

            if (sellerWallet != null)
            {
                var frozenAmount = dispute.Amount ?? 0;
                
                // Move money: DisputedBalance ? AvailableBalance
                sellerWallet.DisputedBalance -= frozenAmount;
                sellerWallet.CreditAvailable(frozenAmount);
                sellerWallet.UpdatedAt = DateTime.UtcNow;
            }
        }

        dispute.RefundAmount = 0;
    }

    private async Task ProcessSplitDecision(Dispute dispute, int? sellerId, decimal refundAmount, CancellationToken cancellationToken)
    {
        var disputedAmount = dispute.Amount ?? 0;
        var sellerKeeps = disputedAmount - refundAmount;

        // Update order status
        if (dispute.Order != null)
        {
            dispute.Order.Status = "PartiallyRefunded";
        }

        // Update seller wallet
        if (sellerId.HasValue)
        {
            var sellerWallet = await _context.SellerWallets
                .FirstOrDefaultAsync(w => w.SellerId == sellerId.Value, cancellationToken);

            if (sellerWallet != null)
            {
                // Seller keeps part, refunds part
                sellerWallet.DisputedBalance -= disputedAmount;
                sellerWallet.CreditAvailable(sellerKeeps);
                sellerWallet.TotalRefunded += refundAmount;
                sellerWallet.UpdatedAt = DateTime.UtcNow;
            }
        }

        // Create refund transaction for buyer
        var refundTransaction = new FinancialTransaction
        {
            SellerId = dispute.RaisedBy ?? 0,
            Type = "PartialRefund",
            Amount = refundAmount,
            Description = $"Partial refund for dispute {dispute.CaseId} (Split decision)",
            OrderId = dispute.OrderId,
            Date = DateTime.UtcNow
        };
        _context.FinancialTransactions.Add(refundTransaction);

        dispute.RefundProcessedAt = DateTime.UtcNow;
        dispute.RefundTransactionId = Guid.NewGuid().ToString();
    }
}
