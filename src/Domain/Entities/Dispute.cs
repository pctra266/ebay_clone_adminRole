using System;
using System.Collections.Generic;

namespace EbayClone.Infrastructure;

public partial class Dispute
{
    public int Id { get; set; }

    public int? OrderId { get; set; }

    public int? RaisedBy { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; }

    public string? Resolution { get; set; }

    // New fields for Dispute Management
    public string? CaseId { get; set; } // Unique case code: DSP-001
    
    public string Priority { get; set; } = "Medium"; // 'High', 'Medium', 'Low'
    
    public decimal? Amount { get; set; } // Dispute amount
    
    public DateTime? Deadline { get; set; } // Resolution deadline
    
    public string? BuyerEvidence { get; set; } // JSON: URLs of images/videos
    
    public string? SellerEvidence { get; set; } // JSON: URLs of images/videos
    
    public string? ChatLog { get; set; } // JSON: Chat history between parties
    
    public string? AdminNotes { get; set; }
    
    public int? ResolvedBy { get; set; } // Admin ID
    
    public DateTime? ResolvedAt { get; set; }
    
    public string? Winner { get; set; } // 'Buyer', 'Seller', NULL

    public virtual OrderTable? Order { get; set; }

    public virtual User? RaisedByNavigation { get; set; }
}
