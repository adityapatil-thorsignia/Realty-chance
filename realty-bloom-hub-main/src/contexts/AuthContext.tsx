import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import axios from 'axios';

export let setAuthToken: (token: string) => void;
export let clearAuthToken: () => void;

interface User {
  id: string;
  phone: string;
  email: string;
  full_name: string;
  role: string;
  is_phone_verified: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    re_password: string;
    phone: string;
    full_name: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUserRole: (newRole: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

setAuthToken = (token: string) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

clearAuthToken = () => {
  delete axios.defaults.headers.common['Authorization'];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuthToken = async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (!storedRefreshToken) return null;

    try {
      const response = await authApi.refreshToken(storedRefreshToken);
      const { access } = response.data;
      localStorage.setItem('auth_token', access);
      setAuthToken(access);
      return access;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const initializeAuth = async () => {
    console.log('Initializing auth...');
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');

    console.log('Stored auth data:', {
      savedUser,
      token,
      storedRefreshToken
    });

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Parsed user data:', parsedUser);
        
        // Set the token in axios defaults first
        setAuthToken(token);
        
        // Set the user state immediately to prevent flashing
        setUser({
          ...parsedUser,
          token,
        });
        
        // Verify token is still valid by making a request
        try {
          console.log('Verifying token with getCurrentUser...');
          const response = await authApi.getCurrentUser();
          console.log('getCurrentUser response:', response.data);
          
          // If we get here, the token is valid
          // No need to update user state since we already have it
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token expired, try to refresh
          console.log('Attempting token refresh...');
          const newToken = await refreshAuthToken();
          if (newToken) {
            console.log('Token refresh successful');
            // Update the token in localStorage and axios defaults
            localStorage.setItem('auth_token', newToken);
            setAuthToken(newToken);
            
            // Update user state with new token
            setUser(prevUser => {
              if (!prevUser) return null;
              return {
                ...prevUser,
                token: newToken,
              };
            });
          } else {
            console.error('Token refresh failed');
            throw new Error('Token refresh failed');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthToken();
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
    } else {
      // No saved user data, ensure we're logged out
      setUser(null);
      clearAuthToken();
    }
    setLoading(false);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', { phone });
      const response = await authApi.login(phone, password);
      console.log('Login response:', response.data);
      const { access, refresh, user: userData } = response.data;

      if (!access || !refresh || !userData) {
        console.error('Invalid response data:', response.data);
        throw new Error('Invalid response from server');
      }

      // Store tokens and user data
      localStorage.setItem('auth_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('Stored tokens:', {
        auth_token: access,
        refresh_token: refresh,
        user: userData
      });

      // Set auth token in axios defaults
      setAuthToken(access);

      // Update auth context
      setUser({
        ...userData,
        token: access,
      });

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    re_password: string;
    phone: string;
    full_name: string;
  }) => {
    setLoading(true);
    try {
      const response = await authApi.register(userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthToken();
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  const updateUserRole = async (newRole: string) => {
    setLoading(true);
    try {
      if (!user) throw new Error("User not authenticated to update role");

      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
        updateUserRole,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
