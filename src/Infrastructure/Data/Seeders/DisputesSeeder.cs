using EbayClone.Domain.Constants;
using EbayClone.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EbayClone.Infrastructure.Data.Seeders;

public class DisputesSeeder : ISeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DisputesSeeder> _logger;

    public int Order => 9;

    public DisputesSeeder(ApplicationDbContext context, ILogger<DisputesSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (_context.Disputes.Any())
        {
            _logger.LogInformation("Disputes already seeded, skipping...");
            return;
        }

        var johnBuyer = await _context.Users.FirstOrDefaultAsync(u => u.Username == "john_buyer");
        var techSeller = await _context.Users.FirstOrDefaultAsync(u => u.Username == "tech_seller_pro");
        var fashionSeller = await _context.Users.FirstOrDefaultAsync(u => u.Username == "fashion_boutique");
        var systemUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == "system");

        if (johnBuyer == null || techSeller == null || fashionSeller == null || systemUser == null)
        {
            _logger.LogWarning("Required users not found for dispute seeding");
            return;
        }

        // Create sample orders first
        var sampleOrders = new List<OrderTable>
        {
            new OrderTable
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-15),
                TotalPrice = 1000.00m,
                Status = "Delivered",
                CompletedAt = DateTime.UtcNow.AddDays(-10),
                CanDisputeUntil = DateTime.UtcNow.AddDays(20), // 30 days from delivery
                PlatformFee = 129.00m, // 12.9%
                SellerEarnings = 871.00m
            },
            new OrderTable
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-8),
                TotalPrice = 1200.00m,
                Status = "Shipped",
                PlatformFee = 154.80m,
                SellerEarnings = 1045.20m
            },
            new OrderTable
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-5),
                TotalPrice = 150.50m,
                Status = "Delivered",
                CompletedAt = DateTime.UtcNow.AddDays(-2),
                CanDisputeUntil = DateTime.UtcNow.AddDays(28),
                PlatformFee = 19.41m,
                SellerEarnings = 131.09m
            }
        };

        _context.OrderTables.AddRange(sampleOrders);
        await _context.SaveChangesAsync();

        // Create disputes
        var disputes = new List<Dispute>
        {
            // CASE 1: High Priority - INAD (Wrong Size) - Escalated
            new Dispute
            {
                CaseId = $"DSP-{DateTime.UtcNow:yyyyMMdd}-001",
                OrderId = sampleOrders[0].Id,
                RaisedBy = johnBuyer.Id,
                Type = DisputeTypes.INAD,
                Subcategory = "WrongSize",
                Description = "Received Size 8 instead of Size 10 as ordered",
                DesiredOutcome = "FullRefund",
                Amount = 1000.00m,
                Priority = DisputePriorities.High,
                Status = DisputeStatuses.Escalated,
                CreatedAt = DateTime.UtcNow.AddDays(-4),
                FirstResponseAt = DateTime.UtcNow.AddDays(-3),
                EscalatedAt = DateTime.UtcNow.AddDays(-1),
                Deadline = DateTime.UtcNow.AddHours(23),
                BuyerEvidence = "[{\"type\":\"image\",\"url\":\"size8-label.jpg\",\"description\":\"Photo showing Size 8 label\"},{\"type\":\"image\",\"url\":\"receipt.jpg\",\"description\":\"Receipt showing Size 10 order\"},{\"type\":\"video\",\"url\":\"unboxing.mp4\",\"description\":\"Unboxing video\"}]",
                SellerEvidence = "[{\"type\":\"image\",\"url\":\"packing.jpg\",\"description\":\"Packing process\"},{\"type\":\"image\",\"url\":\"size10-tag.jpg\",\"description\":\"Size 10 tag visible\"},{\"type\":\"image\",\"url\":\"shipping-label.jpg\",\"description\":\"Shipping label with order number\"}]",
                OfferHistory = "[{\"amount\":300,\"percentage\":30,\"offeredBy\":\"Seller\",\"timestamp\":\"" + DateTime.UtcNow.AddDays(-2).ToString("o") + "\",\"status\":\"Declined\",\"reason\":\"Goodwill gesture\"}]",
                NegotiationRounds = 2,
                LastOfferAmount = 300.00m,
                TrackingNumber = "1Z999AA10123456784",
                DeliveryStatus = "Delivered",
                RequiresReturn = true,
                IsHighValue = true,
                ViewCount = 0
            },

            // CASE 2: Critical Priority - INR (Item Not Received)
            new Dispute
            {
                CaseId = $"DSP-{DateTime.UtcNow:yyyyMMdd}-002",
                OrderId = sampleOrders[1].Id,
                RaisedBy = johnBuyer.Id,
                Type = DisputeTypes.INR,
                Subcategory = "NeverArrived",
                Description = "Package shows delivered but I never received it. Checked with neighbors and building manager.",
                DesiredOutcome = "FullRefund",
                Amount = 1200.00m,
                Priority = DisputePriorities.Critical,
                Status = DisputeStatuses.UnderReview,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                FirstResponseAt = DateTime.UtcNow.AddDays(-1),
                EscalatedAt = DateTime.UtcNow.AddHours(-12),
                AssignedAt = DateTime.UtcNow.AddHours(-2),
                Deadline = DateTime.UtcNow.AddHours(5),
                BuyerEvidence = "[{\"type\":\"image\",\"url\":\"front-door.jpg\",\"description\":\"No package at my door\"},{\"type\":\"image\",\"url\":\"tracking-screenshot.jpg\",\"description\":\"Tracking shows delivered\"}]",
                SellerEvidence = "[{\"type\":\"image\",\"url\":\"packed-box.jpg\",\"description\":\"Properly packed MacBook\"},{\"type\":\"document\",\"url\":\"tracking-proof.pdf\",\"description\":\"Carrier confirmation\"}]",
                TrackingNumber = "1Z999AA10987654321",
                DeliveryStatus = "Delivered",
                RequiresReturn = false,
                IsHighValue = true,
                ViewCount = 3,
                LastViewedAt = DateTime.UtcNow.AddHours(-1)
            },

            // CASE 3: Medium Priority - INAD (Wrong Item) - Awaiting Seller
            new Dispute
            {
                CaseId = $"DSP-{DateTime.UtcNow:yyyyMMdd}-003",
                OrderId = sampleOrders[2].Id,
                RaisedBy = johnBuyer.Id,
                Type = DisputeTypes.INAD,
                Subcategory = "WrongColor",
                Description = "Ordered Black phone case but received Blue",
                DesiredOutcome = "Replacement",
                Amount = 150.50m,
                Priority = DisputePriorities.Medium,
                Status = DisputeStatuses.AwaitingSellerResponse,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                Deadline = DateTime.UtcNow.AddHours(48),
                BuyerEvidence = "[{\"type\":\"image\",\"url\":\"blue-case.jpg\",\"description\":\"Received blue case\"},{\"type\":\"image\",\"url\":\"order-screenshot.jpg\",\"description\":\"Order confirmation for black case\"}]",
                TrackingNumber = "1Z999AA10555555555",
                DeliveryStatus = "Delivered",
                RequiresReturn = true,
                ViewCount = 0
            }
        };

        _context.Disputes.AddRange(disputes);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} Sample Disputes", disputes.Count);

        // Seed dispute messages for Case 1 (chat history)
        var case1 = disputes[0];
        var messages = new List<DisputeMessage>
        {
            new DisputeMessage
            {
                DisputeId = case1.Id,
                SenderId = johnBuyer.Id,
                SenderType = SenderTypes.Buyer,
                MessageType = MessageTypes.Evidence,
                Content = "Hi, I received the shoes but they're Size 8, not Size 10 as I ordered.",
                CreatedAt = DateTime.UtcNow.AddDays(-4).AddHours(1),
                IsRead = true
            },
            new DisputeMessage
            {
                DisputeId = case1.Id,
                SenderId = techSeller.Id,
                SenderType = SenderTypes.Seller,
                MessageType = MessageTypes.Response,
                Content = "I'm sorry to hear that. Can you send me a photo of the size label?",
                CreatedAt = DateTime.UtcNow.AddDays(-3).AddHours(-3),
                IsRead = true
            },
            new DisputeMessage
            {
                DisputeId = case1.Id,
                SenderId = johnBuyer.Id,
                SenderType = SenderTypes.Buyer,
                MessageType = MessageTypes.Evidence,
                Content = "Here are the photos showing Size 8 label.",
                Attachments = "[{\"url\":\"size8-photo.jpg\",\"type\":\"image\"}]",
                CreatedAt = DateTime.UtcNow.AddDays(-3).AddHours(-1),
                IsRead = true
            },
            new DisputeMessage
            {
                DisputeId = case1.Id,
                SenderId = techSeller.Id,
                SenderType = SenderTypes.Seller,
                MessageType = MessageTypes.Offer,
                Content = "I've checked my records and I'm confident I sent Size 10. However, to resolve this quickly, I can offer you a 30% refund ($300) as a goodwill gesture.",
                OfferAmount = 300.00m,
                OfferReason = "Goodwill gesture for inconvenience",
                CreatedAt = DateTime.UtcNow.AddDays(-2).AddHours(3),
                IsRead = true
            },
            new DisputeMessage
            {
                DisputeId = case1.Id,
                SenderId = johnBuyer.Id,
                SenderType = SenderTypes.Buyer,
                MessageType = MessageTypes.Decline,
                Content = "No, I paid $1,000 for Size 10. I want a full refund.",
                CreatedAt = DateTime.UtcNow.AddDays(-2).AddHours(6),
                IsRead = true
            },
            new DisputeMessage
            {
                DisputeId = case1.Id,
                SenderId = techSeller.Id,
                SenderType = SenderTypes.Seller,
                MessageType = MessageTypes.Response,
                Content = "I understand your frustration. Can you ship the item back to me for inspection? I'll cover the return shipping cost.",
                CreatedAt = DateTime.UtcNow.AddDays(-1).AddHours(-12),
                IsRead = true
            },
            new DisputeMessage
            {
                DisputeId = case1.Id,
                SenderId = systemUser.Id, // Use system user instead of 0
                SenderType = SenderTypes.System,
                MessageType = MessageTypes.SystemUpdate,
                Content = "This case has been escalated to eBay Customer Service due to no resolution after 72 hours.",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                IsRead = false,
                IsInternal = false
            }
        };

        _context.DisputeMessages.AddRange(messages);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} Dispute Messages", messages.Count);
    }
}
