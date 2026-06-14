import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/products/categories');
    return res.data;
  },

  // Admin
  createProduct: async (formData) => {
    const res = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateProduct: async (id, formData) => {
    const res = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  deleteProductImage: async (id, imageIndex) => {
    const res = await api.delete(`/products/${id}/images/${imageIndex}`);
    return res.data;
  },

  // Reviews
  getReviews: async (productId) => {
    const res = await api.get(`/products/${productId}/reviews`);
    return res.data;
  },

  createReview: async (productId, data) => {
    const res = await api.post(`/products/${productId}/reviews`, data);
    return res.data;
  },

  updateReview: async (productId, reviewId, data) => {
    const res = await api.put(`/products/${productId}/reviews/${reviewId}`, data);
    return res.data;
  },

  deleteReview: async (productId, reviewId) => {
    const res = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return res.data;
  },
};
