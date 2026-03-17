using System;

namespace EbayClone.Application.Reviews;

public record ReviewModerationDto
{
    public int Id { get; init; }
    public int? ProductId { get; init; }
    public string? ProductTitle { get; init; }
    public int? ReviewerId { get; init; }
    public string? ReviewerName { get; init; }
    public int? Rating { get; init; }
    public string? Comment { get; init; }
    public DateTime? CreatedAt { get; init; }
    public string Status { get; init; } = null!;
    public bool FlaggedBySystem { get; init; }
    public string? FlagReason { get; init; }
}
