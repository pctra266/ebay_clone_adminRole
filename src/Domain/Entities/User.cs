using System;
using System.Collections.Generic;

namespace EbayClone.Infrastructure;

public partial class User
{
    public int Id { get; set; }

    public string? Username { get; set; }

    public string? Email { get; set; }

    public string? Password { get; set; }

    public string? Role { get; set; }

    public string? AvatarUrl { get; set; }

    // New fields for User Management
    public string Status { get; set; } = "Active"; // 'Active', 'Pending', 'Banned', 'Suspended'
    
    public string ApprovalStatus { get; set; } = "Approved"; // 'Approved', 'PendingApproval', 'Rejected'
    
    public int? ApprovedBy { get; set; } // Admin ID who approved
    
    public DateTime? ApprovedAt { get; set; }
    
    public string? BannedReason { get; set; }
    
    public int? BannedBy { get; set; } // Admin ID who banned
    
    public DateTime? BannedAt { get; set; }
    
    // 2FA fields
    public bool TwoFactorEnabled { get; set; } = false;
    
    public string? TwoFactorSecret { get; set; }
    
    // Security fields
    public string? IpWhitelist { get; set; } // JSON array of allowed IPs
    
    public string? LastLoginIp { get; set; }
    
    public DateTime? LastLoginAt { get; set; }
    
    // Verification fields
    public int ViolationCount { get; set; } = 0;
    
    public bool IsVerified { get; set; } = false; // KYC verification
    
    public string? VerificationDocuments { get; set; } // JSON: CCCD, Business License

    public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();

    public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();

    public virtual ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Message> MessageReceivers { get; set; } = new List<Message>();

    public virtual ICollection<Message> MessageSenders { get; set; } = new List<Message>();

    public virtual ICollection<OrderTable> OrderTables { get; set; } = new List<OrderTable>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<ReturnRequest> ReturnRequests { get; set; } = new List<ReturnRequest>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<Store> Stores { get; set; } = new List<Store>();
}
