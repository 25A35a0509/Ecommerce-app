import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Globally handle expired/invalid sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Builds the full URL for a product/avatar image stored on the backend.
 * Returns a placeholder if no path is given.
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x400?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${UPLOADS_URL}${path}`;
};

export default api;
