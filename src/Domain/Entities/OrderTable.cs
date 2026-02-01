using System;
using System.Collections.Generic;

namespace EbayClone.Domain.Entities;

public partial class OrderTable
{
    public int Id { get; set; }

    public int? BuyerId { get; set; }

    public int? AddressId { get; set; }

    public DateTime? OrderDate { get; set; }

    public decimal? TotalPrice { get; set; }

    public string? Status { get; set; }

    // New fields for Financial Management
    public DateTime? CompletedAt { get; set; } // When buyer received order
    
    public DateTime? CanDisputeUntil { get; set; } // Dispute deadline
    
    public decimal? PlatformFee { get; set; } // Platform commission
    
    public decimal? SellerEarnings { get; set; } // Amount seller receives

    public virtual Address? Address { get; set; }

    public virtual User? Buyer { get; set; }

    public virtual ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<ReturnRequest> ReturnRequests { get; set; } = new List<ReturnRequest>();

    public virtual ICollection<ShippingInfo> ShippingInfos { get; set; } = new List<ShippingInfo>();
}
