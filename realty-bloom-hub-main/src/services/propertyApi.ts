// src/services/propertyApi.ts

import api from './api'; // Axios instance with token interceptor
import { AxiosResponse } from 'axios';

// Wrapper for property-related API calls

const propertyApi = {
  /**
   * Fetch properties with optional filters
   */
  getProperties: async (filters: any = {}): Promise<AxiosResponse> => {
    try {
      const response = await api.get('/api/properties/', { params: filters });
      return response;
    } catch (error) { // @ts-ignore
      console.error('Error fetching properties:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Fetch a single property by ID
   */
  getPropertyById: async (id: string): Promise<AxiosResponse> => {
    try {
      const response = await api.get(`/api/properties/${id}/`);
      return response;
    } catch (error) { // @ts-ignore
      console.error(`Error fetching property ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create a new property
   */
  create: async (formData: FormData): Promise<AxiosResponse> => {
    try {
      const response = await api.post('/api/properties/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) { // @ts-ignore
      console.error('Error creating property:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default propertyApi;
