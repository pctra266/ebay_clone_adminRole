namespace EbayClone.Domain.Constants;

public static class DisputeStatuses
{
    public const string Open = nameof(Open);
    public const string AwaitingSellerResponse = nameof(AwaitingSellerResponse);
    public const string Negotiating = nameof(Negotiating);
    public const string Escalated = nameof(Escalated);
    public const string AssignedToAdmin = nameof(AssignedToAdmin);
    public const string UnderReview = nameof(UnderReview);
    public const string Resolved = nameof(Resolved);
    public const string Closed = nameof(Closed);
}

public static class DisputeTypes
{
    public const string INR = "INR"; // Item Not Received
    public const string INAD = "INAD"; // Item Not as Described
    public const string Damaged = nameof(Damaged);
    public const string Counterfeit = nameof(Counterfeit);
    public const string Other = nameof(Other);
}

public static class DisputePriorities
{
    public const string Critical = nameof(Critical);
    public const string High = nameof(High);
    public const string Medium = nameof(Medium);
    public const string Low = nameof(Low);
}

public static class DisputeWinners
{
    public const string Buyer = nameof(Buyer);
    public const string Seller = nameof(Seller);
    public const string Split = nameof(Split);
}

public static class MessageTypes
{
    public const string Response = nameof(Response);
    public const string Offer = nameof(Offer);
    public const string Accept = nameof(Accept);
    public const string Decline = nameof(Decline);
    public const string Evidence = nameof(Evidence);
    public const string Note = nameof(Note);
    public const string SystemUpdate = nameof(SystemUpdate);
}

public static class SenderTypes
{
    public const string Buyer = nameof(Buyer);
    public const string Seller = nameof(Seller);
    public const string Admin = nameof(Admin);
    public const string System = nameof(System);
}
