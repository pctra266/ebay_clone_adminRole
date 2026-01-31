using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace EbayClone.Infrastructure;

public partial class WithdrawalRequest
{
    public int Id { get; set; }

    public int SellerId { get; set; }

    public decimal Amount { get; set; }

    public string? BankName { get; set; }

    public string? BankAccountNumber { get; set; }

    public string? BankAccountName { get; set; }

    public string Status { get; set; } = "Pending"; // 'Pending', 'Processing', 'Approved', 'Rejected'

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public int? ProcessedBy { get; set; } // Admin ID

    public DateTime? ProcessedAt { get; set; }

    public string? RejectionReason { get; set; }

    public string? TransactionId { get; set; } // Bank transaction ID

    // Navigation properties
    [ForeignKey(nameof(SellerId))]
    public virtual User? Seller { get; set; }

    [ForeignKey(nameof(ProcessedBy))]
    public virtual User? Processor { get; set; }
}
