import api from './api';

export const orderService = {
  placeOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  getMyOrders: async (params = {}) => {
    const res = await api.get('/orders/my-orders', { params });
    return res.data;
  },

  // Admin
  getAllOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  updateOrderStatus: async (id, orderStatus) => {
    const res = await api.put(`/orders/${id}/status`, { orderStatus });
    return res.data;
  },

  getOrderStats: async () => {
    const res = await api.get('/orders/stats/dashboard');
    return res.data;
  },
};
