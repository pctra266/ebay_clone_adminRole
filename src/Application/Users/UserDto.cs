namespace EbayClone.Application.Users;

public class UserDto
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? AvatarUrl { get; set; }
    
    // Status fields
    public string Status { get; set; } = "Active";
    public string ApprovalStatus { get; set; } = "Approved";
    
    // Ban info
    public string? BannedReason { get; set; }
    public int? BannedBy { get; set; }
    public DateTime? BannedAt { get; set; }
    
    // Approval info
    public int? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    
    // Security & Verification
    public bool TwoFactorEnabled { get; set; }
    public bool IsVerified { get; set; }
    public int ViolationCount { get; set; }
    
    // Login info
    public string? LastLoginIp { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
