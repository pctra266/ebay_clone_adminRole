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
        return await apiRequest(`${endpoints.financials}/settle`, {
            method: 'POST'
        });
    }
};

export default financeService;
