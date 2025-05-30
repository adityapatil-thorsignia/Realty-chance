import axios from 'axios';
import { setAuthToken } from '../contexts/AuthContext';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const publicPaths = ['/api/auth/login/', '/auth/users/', '/api/auth/verify-phone/'];
    const isPublic = publicPaths.some(path => config.url?.includes(path));

    console.log('API Request:', {
      url: config.url,
      method: config.method,
      isPublic,
      headers: config.headers
    });

    if (!isPublic) {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Added auth token to request');
      } else {
        console.log('No auth token available for request');
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting token refresh due to 401 error');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          console.error('No refresh token available');
          throw new Error('No refresh token available');
        }

        console.log('Calling token refresh endpoint');
        const response = await api.post('/api/auth/token/refresh/', {
          refresh: refreshToken
        });
        console.log('Token refresh response:', response.data);

        const { access } = response.data;
        if (!access) {
          throw new Error('No access token in refresh response');
        }

        localStorage.setItem('auth_token', access);
        console.log('Updated auth token in localStorage');

        // Update axios defaults
        setAuthToken(access);

        // Update the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        console.log('Retrying original request with new token');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh token fails, clear auth state and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------- Auth API ----------------------
export const authApi = {
  login: (phone: string, password: string) => {
    console.log('Making login request with:', { phone });
    return api.post('/api/auth/login/', { 
      phone: phone,
      password: password
    });
  },

  register: (userData: {
    email: string;
    password: string;
    re_password: string;
    phone: string;
    full_name: string;
  }) =>
    api.post('/auth/users/', {
      email: userData.email,
      password: userData.password,
      re_password: userData.re_password,
      phone: userData.phone,
      full_name: userData.full_name
    }),

  verifyPhone: (phone: string, code: string) =>
    api.post('/api/auth/verify-phone/', { phone, code }),

  sendVerificationCode: (phone: string, purpose = 'registration') =>
    api.post('/api/auth/send-verification-code/', { phone, purpose }),

  resetPasswordWithPhone: (phone: string, code: string, password: string) =>
    api.post('/api/auth/reset-password/', { phone, code, password }),

  refreshToken: (refresh: string) =>
    api.post('/api/auth/token/refresh/', { refresh }),

  getCurrentUser: () => {
    console.log('Fetching current user...');
    return api.get('/api/properties/my_listings/');
  },
};

// ---------------------- Property API ----------------------
export const propertyApi = {
  getAll: (params = {}) => api.get('/api/properties/', { params }),
  getById: (id: string) => api.get(`/api/properties/${id}/`),
  getFeatured: () => api.get('/api/properties/featured/'),
  getNewProjects: () => api.get('/api/new-projects/'),
  getByFilters: (params: any) => api.get('/api/properties/', { params }),
  create: (data: FormData) => api.post('/api/properties/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id: string, data: FormData | any) => api.put(`/api/properties/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id: string) => api.delete(`/api/properties/${id}/`),
  search: (params: any) => api.get('/api/properties/search/', { params }),
  addToFavorites: (id: string) => api.post(`/api/properties/${id}/favorite/`),
  removeFromFavorites: (id: string) => api.delete(`/api/properties/${id}/favorite/`),
  verifyProperty: (id: string) => api.post(`/api/properties/${id}/verify/`),
  my_listings: () => api.get('/api/properties/my_listings/'),
};

// ---------------------- Inquiry API ----------------------
export const inquiryApi = {
  getAll: () => api.get('/api/inquiries/'),
  getById: (id: string) => api.get(`/api/inquiries/${id}/`),
  create: (data: any) => api.post('/api/inquiries/', data),
  update: (id: string, data: any) => api.put(`/api/inquiries/${id}/`, data),
  delete: (id: string) => api.delete(`/api/inquiries/${id}/`),
  approveInquiry: (id: string) => api.post(`/api/inquiries/${id}/approve/`),
  rejectInquiry: (id: string) => api.post(`/api/inquiries/${id}/reject/`),
};

export default api;
