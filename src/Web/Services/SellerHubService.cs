using EbayClone.Application.Common.Interfaces;
using EbayClone.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace EbayClone.Web.Services;

public class SellerHubService : ISellerHubService
{
    private readonly IHubContext<SellerHub> _hubContext;
    private const string AdminGroup = "Admins";

    public SellerHubService(IHubContext<SellerHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task BroadcastWalletUpdate(int sellerId, decimal availableBalance, decimal pendingBalance, decimal totalWithdrawn)
    {
        await _hubContext.Clients.Group(AdminGroup).SendAsync("UpdateSellerWallet", new
        {
            sellerId,
            availableBalance,
            pendingBalance,
            totalWithdrawn
        });
    }
}
