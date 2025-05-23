import { Phone } from 'lucide-react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

interface User {
  role: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (password: string, phone: string) => Promise<any>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (savedUser && token) {
      // Attach token to user object when loading from localStorage
      const parsedUser = JSON.parse(savedUser);
      setUser({
        ...parsedUser,
        token
      });
    }
    setLoading(false);
  }, []);

  const login = async (password: string, phone: string) => {
    setLoading(true);
    try {
      const response = await fetch('api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      const { user: userData, token, refresh_token } = data;
      
      // Create a complete user object with token attached
      const authenticatedUser = {
        ...userData,
        token
      };
      
      // Save user with token
      setUser(authenticatedUser);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refresh_token);
      
      return authenticatedUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    setLoading(true);
    try {
      const response = await authApi.register({
        phone: phone,
        email: email,
        full_name: name,
        password: password,
        re_password: password
      });
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const verifyOtp = async (otp: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Mock OTP verification
      return true;
    } catch (error) {
      console.error('OTP verification error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register: async (name: string, email: string, password: string,phone:string) => {
        await register(name, email, password, phone);
      },
      // verifyOtp,
      logout,
      loading
    }}>
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