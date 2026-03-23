import httpClient from './httpClient';

const orderService = {
  getOrders: async (params) => {
    const response = await httpClient.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await httpClient.get(`/orders/${id}`);
    return response.data;
  }
};

export default orderService;
