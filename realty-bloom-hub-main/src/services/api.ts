import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    // Do not add Authorization header for login or register endpoints
    if (
      token &&
      config.url &&
      !config.url.includes('/auth/login') &&
      !config.url.includes('/auth/register')
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh if 401 error
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('/api/auth/token/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('auth_token', access);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const propertyApi = {
  getAll: (params = {}) => api.get('/properties/', { params }),
  getById: (id) => api.get(`/properties/${id}/`),
  getFeatured: () => api.get('/properties/featured/'),
  getNewProjects: () => api.get('/properties/new-projects/'),
  create: (data) => api.post('/properties/', data),
  update: (id, data) => api.put(`/properties/${id}/`, data),
  delete: (id) => api.delete(`/properties/${id}/`),
  search: (params) => api.get('/properties/search/', { params }),
  addToFavorites: (id) => api.post(`/properties/${id}/favorite/`),
  removeFromFavorites: (id) => api.delete(`/properties/${id}/favorite/`),
};

export const authApi = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  verifyOtp: (data) => api.post('/auth/verify-otp/', data),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  resetPassword: (email) => api.post('/auth/password-reset/', { email }),
  confirmResetPassword: (data) => api.post('/auth/password-reset/confirm/', data),
};

export const userApi = {
  getFavorites: () => api.get('/user/favorites/'),
  getNotifications: () => api.get('/user/notifications/'),
  updateNotificationSettings: (settings) => api.patch('/user/notification-settings/', settings),
};

export default api;