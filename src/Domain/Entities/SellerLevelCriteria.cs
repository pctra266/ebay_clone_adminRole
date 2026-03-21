using System;

namespace EbayClone.Domain.Entities;

/// <summary>
/// Admin-configurable criteria for evaluating Seller Levels (Top Rated, Above Standard, Below Standard).
/// Singleton pattern (Row with Id = 1).
/// </summary>
public class SellerLevelCriteria
{
    public int Id { get; set; }

    // --- Top Rated Criteria ---
    public int TopRatedMinTransactions { get; set; } = 100;
    public decimal TopRatedMinSales { get; set; } = 1000m;
    public int TopRatedMinDays { get; set; } = 90;
    public int TopRatedMaxUnresolvedCases { get; set; } = 2;
    public double TopRatedMaxDefectRate { get; set; } = 0.005; // 0.5%
    public double TopRatedMaxLateRate { get; set; } = 0.03;   // 3%

    // --- Above Standard Criteria ---
    public double AboveStandardMaxDefectRate { get; set; } = 0.02; // 2%
    public int AboveStandardMaxUnresolvedCases { get; set; } = 2;
    public double AboveStandardMaxUnresolvedRate { get; set; } = 0.003; // 0.3%

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int? UpdatedBy { get; set; }
}
