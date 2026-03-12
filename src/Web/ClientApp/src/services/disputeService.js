import axios from 'axios';

const API_BASE = '/api';

export const disputeService = {
    // ===============================
    // 1. Dashboard Statistics
    // ===============================
    
    // GET /api/disputes/statistics
    getStatistics: async () => {
        try {
            const response = await axios.get(`${API_BASE}/disputes/statistics`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dispute statistics:', error);
            throw error;
        }
    },

    // ===============================
    // 2. Disputes Docket (List)
    // ===============================
    
    // GET /api/disputes?status=Open&pageNumber=1&pageSize=10
    getDisputes: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE}/disputes`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching disputes:', error);
            throw error;
        }
    },

    // ===============================
    // 3. Dispute Detail
    // ===============================
    
    // GET /api/disputes/{id}
    getDisputeDetail: async (id) => {
        try {
            const response = await axios.get(`${API_BASE}/disputes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dispute detail:', error);
            throw error;
        }
    },

    // ===============================
    // 4. Dispute Actions
    // ===============================
    
    // POST /api/disputes/{id}/assign
    assignDispute: async (id) => {
        try {
            const response = await axios.post(`${API_BASE}/disputes/${id}/assign`);
            return response.data;
        } catch (error) {
            console.error('Error assigning dispute:', error);
            throw error;
        }
    },

    // POST /api/disputes/{id}/resolve
    resolveDispute: async (id, payload) => {
        try {
            const response = await axios.post(`${API_BASE}/disputes/${id}/resolve`, payload);
            return response.data;
        } catch (error) {
            console.error('Error resolving dispute:', error);
            throw error;
        }
    }
};