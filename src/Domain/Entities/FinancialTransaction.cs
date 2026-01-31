using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace EbayClone.Infrastructure;

public partial class FinancialTransaction
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Type { get; set; } = string.Empty; // 'OrderPayment', 'Refund', 'Withdrawal', 'PlatformFee'

    public decimal Amount { get; set; }

    public decimal BalanceAfter { get; set; }

    public int? OrderId { get; set; }

    public int? WithdrawalId { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(OrderId))]
    public virtual OrderTable? Order { get; set; }

    [ForeignKey(nameof(WithdrawalId))]
    public virtual WithdrawalRequest? Withdrawal { get; set; }
}
