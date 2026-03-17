import axios from 'axios';

export const dashboardService = {
  getMetrics: async () => {
    const response = await axios.get('/api/dashboard/metrics');
    return response.data;
  }
};
