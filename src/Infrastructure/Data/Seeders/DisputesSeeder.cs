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
        if (_context.Disputes.Count() >= 6)
        {
            _logger.LogInformation("Disputes already seeded with 6+ records, skipping...");
            return;
        }

        bool hasInitial3 = _context.Disputes.Any();

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
            },
            new OrderTable // For Dispute 4
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-20),
                TotalPrice = 500.00m,
                Status = "Delivered",
                CompletedAt = DateTime.UtcNow.AddDays(-15),
                CanDisputeUntil = DateTime.UtcNow.AddDays(15),
                PlatformFee = 60.00m,
                SellerEarnings = 440.00m
            },
            new OrderTable // For Dispute 5
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-2),
                TotalPrice = 80.00m,
                Status = "Shipped",
                PlatformFee = 8.00m,
                SellerEarnings = 72.00m
            },
            new OrderTable // For Dispute 6
            {
                BuyerId = johnBuyer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-10),
                TotalPrice = 350.00m,
                Status = "Delivered",
                CompletedAt = DateTime.UtcNow.AddDays(-5),
                CanDisputeUntil = DateTime.UtcNow.AddDays(25),
                PlatformFee = 35.00m,
                SellerEarnings = 315.00m
            }
        };

        if (!hasInitial3)
        {
            _context.OrderTables.AddRange(sampleOrders.Take(3));
        }
        _context.OrderTables.AddRange(sampleOrders.Skip(3));
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
            },
            new Dispute
            {
                CaseId = $"DSP-{DateTime.UtcNow:yyyyMMdd}-004",
                OrderId = sampleOrders[3].Id,
                RaisedBy = johnBuyer.Id,
                Type = DisputeTypes.Other,
                Subcategory = "MissingParts",
                Description = "The console arrived safely, but the power cord is missing.",
                DesiredOutcome = "PartialRefund",
                Amount = 50.00m,
                Priority = DisputePriorities.Low,
                Status = DisputeStatuses.Open,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                Deadline = DateTime.UtcNow.AddHours(72),
                IsHighValue = false,
                ViewCount = 1
            },
            new Dispute
            {
                CaseId = $"DSP-{DateTime.UtcNow:yyyyMMdd}-005",
                OrderId = sampleOrders[4].Id,
                RaisedBy = johnBuyer.Id,
                Type = DisputeTypes.Damaged,
                Subcategory = "ShatteredScreen",
                Description = "The TV was completely destroyed during shipping. The screen is shattered.",
                DesiredOutcome = "FullRefund",
                Amount = 80.00m,
                Priority = DisputePriorities.High,
                Status = DisputeStatuses.AssignedToAdmin,
                AssignedTo = 1,
                AssignedAt = DateTime.UtcNow.AddHours(-1),
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                FirstResponseAt = DateTime.UtcNow.AddDays(-1),
                EscalatedAt = DateTime.UtcNow.AddHours(-5),
                Deadline = DateTime.UtcNow.AddHours(12),
                BuyerEvidence = "[{\"type\":\"image\",\"url\":\"broken_tv.jpg\",\"description\":\"Shattered TV screen\"}]",
                RequiresReturn = false,
                IsHighValue = false,
                ViewCount = 5
            },
            new Dispute
            {
                CaseId = $"DSP-{DateTime.UtcNow:yyyyMMdd}-006",
                OrderId = sampleOrders[5].Id,
                RaisedBy = johnBuyer.Id,
                Type = DisputeTypes.Counterfeit,
                Subcategory = "FakeBrand",
                Description = "The Airpods are clearly fake. They don't even have a valid serial number.",
                DesiredOutcome = "FullRefund",
                Amount = 350.00m,
                Priority = DisputePriorities.Medium,
                Status = DisputeStatuses.Resolved,
                Winner = DisputeWinners.Buyer,
                ResolvedBy = 1,
                ResolvedAt = DateTime.UtcNow.AddHours(-10),
                AdminNotes = "Buyer provided conclusive proof from Apple Store that the serial number is invalid. Full refund issued.",
                RefundAmount = 350.00m,
                RefundMethod = "OriginalPayment",
                RefundProcessedAt = DateTime.UtcNow.AddHours(-9),
                RefundTransactionId = "TXN-FAKE-12345",
                CreatedAt = DateTime.UtcNow.AddDays(-6),
                FirstResponseAt = DateTime.UtcNow.AddDays(-5),
                EscalatedAt = DateTime.UtcNow.AddDays(-2),
                BuyerEvidence = "[{\"type\":\"image\",\"url\":\"fake_airpods.jpg\",\"description\":\"Fake Airpods\"}]",
                RequiresReturn = false,
                IsHighValue = false,
                IsVeRO = true,
                ViewCount = 8
            }
        };

        if (!hasInitial3)
        {
            _context.Disputes.AddRange(disputes.Take(3));
            await _context.SaveChangesAsync();
        }

        _context.Disputes.AddRange(disputes.Skip(3));
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

        if (!hasInitial3)
        {
            _context.DisputeMessages.AddRange(messages);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} Dispute Messages", messages.Count);
        }
    }
}
