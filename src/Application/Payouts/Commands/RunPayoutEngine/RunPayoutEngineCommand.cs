using EbayClone.Application.Common.Interfaces;
using EbayClone.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EbayClone.Application.Payouts.Commands.RunPayoutEngine;

/// <summary>
/// Trigger the Payout Engine for all eligible Sellers.
/// Returns a PayoutEngineResult summarizing the session.
/// </summary>
public record RunPayoutEngineCommand : IRequest<PayoutEngineResult>
{
    public int? SellerId { get; init; }
}

public record PayoutEngineResult(
    int TotalScanned,
    int Success,
    int Failed,
    int OnHold,
    int Skipped,
    decimal TotalDisbursed,
    string SessionId
);

public class RunPayoutEngineCommandHandler : IRequestHandler<RunPayoutEngineCommand, PayoutEngineResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IMockPaymentGateway _gateway;
    private readonly ILogger<RunPayoutEngineCommandHandler> _logger;

    public RunPayoutEngineCommandHandler(
        IApplicationDbContext context,
        IMockPaymentGateway gateway,
        ILogger<RunPayoutEngineCommandHandler> logger)
    {
        _context = context;
        _gateway = gateway;
        _logger = logger;
    }

    public async Task<PayoutEngineResult> Handle(RunPayoutEngineCommand request, CancellationToken cancellationToken)
    {
        var sessionId = DateTime.UtcNow.ToString("o");
        _logger.LogInformation("===== PAYOUT ENGINE SESSION START ===== | SessionId: {Session}", sessionId);

        // ── 0. Load the payout configuration ─────────────────────────────────
        var config = await _context.PayoutConfigs
            .OrderBy(c => c.Id)
            .FirstOrDefaultAsync(cancellationToken)
            ?? new PayoutConfig();  // fallback to defaults if no row

        if (!config.IsEnabled && !request.SellerId.HasValue)
        {
            _logger.LogInformation("[INFO] Payout Engine is DISABLED by admin. Aborting.");
            return new PayoutEngineResult(0, 0, 0, 0, 0, 0, sessionId);
        }

        _logger.LogInformation("[INFO] Config: Frequency={Frequency}, MinThreshold=${Min}",
            config.Frequency, config.MinimumThreshold);

        // ── 1. Load all Seller wallets with their Sellers ────────────────────
        var query = _context.SellerWallets
            .Include(w => w.Seller)
            .AsQueryable();

        if (request.SellerId.HasValue)
        {
            _logger.LogInformation("[INFO] TARGETED RUN for SellerId: {Id}", request.SellerId.Value);
            query = query.Where(w => w.SellerId == request.SellerId.Value);
        }
        else
        {
            query = query.Where(w => w.AvailableBalance > config.MinimumThreshold);
        }

        var wallets = await query.ToListAsync(cancellationToken);

        _logger.LogInformation("[INFO] Total sellers with eligible balance: {Count}", wallets.Count);

        int successCount = 0, failedCount = 0, holdCount = 0, skippedCount = 0;
        decimal totalDisbursed = 0m;

        foreach (var wallet in wallets)
        {
            var seller = wallet.Seller;
            if (seller == null) { skippedCount++; continue; }

            // ── CONCURRENCY GUARD: skip if a Processing payout already exists ─
            bool alreadyProcessing = await _context.PayoutTransactions
                .AnyAsync(p => p.SellerId == seller.Id
                            && p.Status == PayoutTransaction.StatusProcessing,
                    cancellationToken);

            if (alreadyProcessing)
            {
                _logger.LogWarning("[SKIP] Seller #{Id} ({Name}): Already has a Processing payout. Skipping to avoid double-payout.",
                    seller.Id, seller.Username);
                skippedCount++;
                continue;
            }

            // ── STEP 2: Risk checks ──────────────────────────────────────────
            if (seller.Status is "Suspended" or "Banned")
            {
                _logger.LogInformation("[SKIP] Seller #{Id} ({Name}): Account {Status}.",
                    seller.Id, seller.Username, seller.Status);
                skippedCount++;
                continue;
            }

            // Check for open disputes on any of this seller's orders
            // Also catches demo scenario: dispute seeded directly with RaisedBy = seller and no order
            bool hasOpenDispute = await _context.Disputes
                .AnyAsync(d =>
                    (d.Status == "Open" || d.Status == "InReview") &&
                    (
                        // Case A: order-linked dispute — order has items sold by this seller
                        (d.OrderId != null && d.Order != null &&
                         d.Order.OrderItems.Any(oi => oi.Product != null && oi.Product.SellerId == seller.Id))
                        ||
                        // Case B: direct seller dispute (no order) — used in demo seeding
                        (d.OrderId == null && d.RaisedBy == seller.Id)
                    ),
                    cancellationToken);

            if (hasOpenDispute)
            {
                var holdTx = new PayoutTransaction
                {
                    SellerId = seller.Id,
                    Amount = wallet.AvailableBalance,
                    Status = PayoutTransaction.StatusHold,
                    ErrorLog = "Active dispute found on one or more orders.",
                    BankSnapshot = seller.BankAccountMock,
                    SessionId = sessionId,
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow
                };
                _context.PayoutTransactions.Add(holdTx);
                _logger.LogWarning("[HOLD] Seller #{Id} ({Name}): ${Amount} → Active dispute detected.",
                    seller.Id, seller.Username, wallet.AvailableBalance);
                holdCount++;
                continue;
            }

            // ── STEP 1 Bank info validation ───────────────────────────────────
            if (string.IsNullOrWhiteSpace(seller.BankAccountMock))
            {
                _logger.LogInformation("[SKIP] Seller #{Id} ({Name}): No bank account linked.",
                    seller.Id, seller.Username);
                skippedCount++;
                continue;
            }

            var amountToPay = wallet.AvailableBalance;

            // ── STEP 3: Lock funds → mark as Processing ───────────────────────
            wallet.LockAvailableFunds(amountToPay); // AvailableBalance → LockedBalance

            var payoutTx = new PayoutTransaction
            {
                SellerId = seller.Id,
                Amount = amountToPay,
                Status = PayoutTransaction.StatusProcessing,
                BankSnapshot = seller.BankAccountMock,
                SessionId = sessionId,
                CreatedAt = DateTime.UtcNow
            };
            _context.PayoutTransactions.Add(payoutTx);

            // Flush the lock to DB before calling gateway (ensures idempotency across concurrent runs)
            await _context.SaveChangesAsync(cancellationToken);

            // ── STEP 3: Call Mock Payment Gateway ─────────────────────────────
            var gatewayResult = await _gateway.ProcessAsync(amountToPay, seller.BankAccountMock);

            // ── STEP 4: Post-processing ───────────────────────────────────────
            if (gatewayResult.Success)
            {
                wallet.ConfirmWithdrawal(amountToPay); // LockedBalance → TotalWithdrawn
                payoutTx.Status = PayoutTransaction.StatusSuccess;
                payoutTx.CompletedAt = DateTime.UtcNow;

                // Audit trail
                _context.FinancialTransactions.Add(new FinancialTransaction
                {
                    SellerId = seller.Id,
                    UserId = seller.Id,
                    Type = "AutoPayout",
                    Amount = amountToPay,
                    BalanceAfter = wallet.AvailableBalance,
                    Description = $"[AutoPayout] Session {sessionId} – transferred ${amountToPay:F2}",
                    Date = DateTime.UtcNow
                });

                totalDisbursed += amountToPay;
                successCount++;
                _logger.LogInformation("[SUCCESS] Seller #{Id} ({Name}): ${Amount} → bank ✓",
                    seller.Id, seller.Username, amountToPay);
            }
            else
            {
                // Return funds to Available
                wallet.UnlockFunds(amountToPay);
                payoutTx.Status = PayoutTransaction.StatusFailed;
                payoutTx.ErrorLog = gatewayResult.ErrorMessage;
                payoutTx.CompletedAt = DateTime.UtcNow;

                failedCount++;
                _logger.LogError("[FAILED] Seller #{Id} ({Name}): ${Amount} → {Error}",
                    seller.Id, seller.Username, amountToPay, gatewayResult.ErrorMessage);
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation(
            "[INFO] Summary: {S} Success | {F} Failed | {H} Hold | {K} Skipped | TotalDisbursed: ${D:F2}",
            successCount, failedCount, holdCount, skippedCount, totalDisbursed);
        _logger.LogInformation("===== PAYOUT ENGINE SESSION END =====");

        return new PayoutEngineResult(
            wallets.Count, successCount, failedCount, holdCount, skippedCount, totalDisbursed, sessionId);
    }
}
