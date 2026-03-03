using System;

namespace EbayClone.Domain.Entities;

public partial class SellerWallet
{
    public int Id { get; set; }

    public int SellerId { get; set; }

    public decimal PendingBalance { get; set; } = 0; // Money on hold (new sales, awaiting clearance)

    public decimal AvailableBalance { get; set; } = 0; // Money available for withdrawal

    public decimal DisputedBalance { get; set; } = 0; // Money frozen due to disputes

    public decimal TotalEarnings { get; set; } = 0;

    public decimal TotalWithdrawn { get; set; } = 0;
    
    public decimal TotalRefunded { get; set; } = 0; // Total refunded due to disputes/returns

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User? Seller { get; set; }
}
