using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace EbayClone.Infrastructure;

public partial class ProductReport
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public int? ReporterUserId { get; set; } // NULL for VeRO reports

    public string ReporterType { get; set; } = "User"; // 'User' or 'BrandOwner' (VeRO)

    public string? Reason { get; set; }

    public string? EvidenceFiles { get; set; } // JSON: URLs of images/PDFs

    public string Status { get; set; } = "Pending"; // 'Pending', 'Resolved', 'Rejected'

    public string Priority { get; set; } = "Medium"; // 'Low', 'Medium', 'High', 'VeRO'

    public int? ResolvedBy { get; set; } // Admin ID

    public DateTime? ResolvedAt { get; set; }

    public string? Resolution { get; set; } // Admin's decision

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(ProductId))]
    public virtual Product? Product { get; set; }

    [ForeignKey(nameof(ReporterUserId))]
    public virtual User? ReporterUser { get; set; }

    [ForeignKey(nameof(ResolvedBy))]
    public virtual User? Resolver { get; set; }
}
