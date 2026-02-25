using EbayClone.Infrastructure;

namespace EbayClone.Application.Users;

public class UserBriefDto
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? AvatarUrl { get; set; }
    public string Status { get; set; } = "Active";
    public string ApprovalStatus { get; set; } = "Approved";
    public bool IsVerified { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public static class UserMappingExtensions
{
    public static UserDto ToDto(this User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            AvatarUrl = user.AvatarUrl,
            Status = user.Status,
            ApprovalStatus = user.ApprovalStatus,
            BannedReason = user.BannedReason,
            BannedBy = user.BannedBy,
            BannedAt = user.BannedAt,
            ApprovedBy = user.ApprovedBy,
            ApprovedAt = user.ApprovedAt,
            TwoFactorEnabled = user.TwoFactorEnabled,
            IsVerified = user.IsVerified,
            ViolationCount = user.ViolationCount,
            LastLoginIp = user.LastLoginIp,
            LastLoginAt = user.LastLoginAt
        };
    }

    public static UserBriefDto ToBriefDto(this User user)
    {
        return new UserBriefDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            AvatarUrl = user.AvatarUrl,
            Status = user.Status,
            ApprovalStatus = user.ApprovalStatus,
            IsVerified = user.IsVerified,
            LastLoginAt = user.LastLoginAt
        };
    }
}
