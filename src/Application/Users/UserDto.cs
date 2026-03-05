namespace EbayClone.Application.Users;

public class UserBriefDto
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string Status { get; set; } = "Active";
    public string ApprovalStatus { get; set; } = "Approved";
    public bool IsVerified { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class UserDto
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string Status { get; set; } = "Active";
    public string ApprovalStatus { get; set; } = "Approved";
    public string? BannedReason { get; set; }
    public int? BannedBy { get; set; }
    public DateTime? BannedAt { get; set; }
    public int? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool IsVerified { get; set; }
    public int ViolationCount { get; set; }
    public string? LastLoginIp { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? MaskedPhone { get; set; }
    public string? MaskedNationalId { get; set; }
    public List<UserOrderHistoryDto> OrderHistory { get; set; } = new();
    public List<UserViolationHistoryDto> ViolationHistory { get; set; } = new();
}

public class UserOrderHistoryDto
{
    public int OrderId { get; set; }
    public DateTime? OrderDate { get; set; }
    public string? Status { get; set; }
    public decimal? TotalPrice { get; set; }
}

public class UserViolationHistoryDto
{
    public int AuditLogId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; }
    public int AdminId { get; set; }
    public string? AdminUsername { get; set; }
}

