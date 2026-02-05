using System;

namespace EbayClone.Domain.Entities;

public partial class SellerWallet
{
    public int Id { get; set; }

    public int SellerId { get; set; }

    public decimal PendingBalance { get; private set; } = 0; // Money on hold

    public decimal AvailableBalance { get; private set; } = 0; // Money available for withdrawal

    public decimal TotalEarnings { get; private set; } = 0;

    public decimal TotalWithdrawn { get; private set; } = 0;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User? Seller { get; set; }

    public void CreditPending(decimal amount)
    {
        if (amount < 0) throw new ArgumentException("Amount must be positive");
        PendingBalance += amount;
        TotalEarnings += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MovePendingToAvailable(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be positive");
        if (PendingBalance < amount) throw new InvalidOperationException("Insufficient pending balance");
        
        PendingBalance -= amount;
        AvailableBalance += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DeductAvailable(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be positive");
        if (AvailableBalance < amount) throw new InvalidOperationException("Insufficient available balance");

        AvailableBalance -= amount;
        TotalWithdrawn += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RefundFromPending(decimal amount)
    {
         if (amount <= 0) throw new ArgumentException("Amount must be positive");
         if (PendingBalance < amount) throw new InvalidOperationException("Insufficient pending balance");

         PendingBalance -= amount;
         TotalEarnings -= amount; // Revert earning
         UpdatedAt = DateTime.UtcNow;
    }

    public void CreditAvailable(decimal amount)
    {
        if (amount < 0) throw new ArgumentException("Amount must be positive");
        AvailableBalance += amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
