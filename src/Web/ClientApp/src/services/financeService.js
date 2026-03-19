import { apiRequest } from './httpClient';
import endpoints from './endpoints';

const financeService = {
    getSellerWallets: async () => {
        return await apiRequest(endpoints.wallets);
    },

    getWithdrawalRequests: async (status) => {
        const url = status ? `${endpoints.financials}/withdrawals?status=${status}` : `${endpoints.financials}/withdrawals`;
        return await apiRequest(url);
    },

    approveWithdrawal: async (id, transactionId) => {
        return await apiRequest(`${endpoints.financials}/withdrawals/${id}/approve`, {
            method: 'POST',
            body: { transactionId }
        });
    },

    rejectWithdrawal: async (id, reason) => {
        return await apiRequest(`${endpoints.financials}/withdrawals/${id}/reject`, {
            method: 'POST',
            body: { reason }
        });
    },

    settleFunds: async () => {
        return await apiRequest(`${endpoints.financials}/trigger-settlement`, {
            method: 'POST'
        });
    },

    getPendingSettlementOrders: async () => {
        return await apiRequest(`${endpoints.financials}/settlement-orders`);
    },

    settleOrder: async (id) => {
        return await apiRequest(`${endpoints.financials}/settle-order/${id}`, {
            method: 'POST'
        });
    },

    getSellerPendingFunds: async (sellerId) => {
        return await apiRequest(`${endpoints.financials}/pending/${sellerId}`);
    }
};

export default financeService;
