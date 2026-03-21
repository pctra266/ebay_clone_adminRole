namespace EbayClone.Application.Common.Interfaces;

public interface ISellerHubService
{
    Task BroadcastWalletUpdate(int sellerId, decimal availableBalance, decimal pendingBalance, decimal totalWithdrawn);
}
