using System;

namespace EbayClone.Infrastructure;

public partial class SellerWallet
{
    public int Id { get; set; }

    public int SellerId { get; set; }

    public decimal PendingBalance { get; set; } = 0; // Money on hold

    public decimal AvailableBalance { get; set; } = 0; // Money available for withdrawal

    public decimal TotalEarnings { get; set; } = 0;

    public decimal TotalWithdrawn { get; set; } = 0;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User? Seller { get; set; }
}
