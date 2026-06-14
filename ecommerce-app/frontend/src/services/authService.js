import api from './api';

export const authService = {
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  login: async (data) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  updateProfile: async (formData) => {
    const res = await api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Admin
  getAllUsers: async (params = {}) => {
    const res = await api.get('/auth/users', { params });
    return res.data;
  },

  updateUserRole: async (id, role) => {
    const res = await api.put(`/auth/users/${id}/role`, { role });
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/auth/users/${id}`);
    return res.data;
  },
};
