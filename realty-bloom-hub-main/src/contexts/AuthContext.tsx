import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Assuming your axios instance is exported as 'api'

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string; // Added optional phone
  role?: string; // Added optional role
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>; // Updated signature and return type
  register: (name: string, email: string, password: string, phone: string, confirmPassword?: string) => Promise<boolean>; // Updated signature and return type
  verifyOtp: (otp: string, phone: string) => Promise<boolean>; // Added verifyOtp
  logout: () => void;
  loading: boolean; // Added loading
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // State to temporarily store phone/userId after registration for OTP step
  const [tempUserForVerification, setTempUserForVerification] = useState<{ userId: number; phone: string } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Optionally verify token or fetch user details
          // For now, assume token means authenticated
          // You might want to add a /auth/profile/ endpoint to fetch user details
          // based on the token.
          // const response = await api.get('/auth/profile/');
          // setUser(response.data);

          // Simple check based on token presence
           setUser({ id: 0, name: 'Authenticated User', email: '' }); // Placeholder user

        } catch (error) {
          console.error('Error loading user from token:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login/', { phone, password });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('auth_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      let errorMsg = 'Login failed. Please check your credentials.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      }
      return { success: false, error: errorMsg };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone: string, confirmPassword?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register/', {
        full_name: name, // Backend expects 'full_name'
        email,
        phone,
        password,
        password2: confirmPassword || password // Send both as required
      });
      // Registration successful, skip OTP for now
      setLoading(false);
      return true; // Indicate success
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return false; // Indicate failure
    }
  }, []);

  const verifyOtp = useCallback(async (otp: string, phone: string): Promise<boolean> => {
     setLoading(true);
     try {
       // Use the phone number obtained during registration
       const response = await api.post('/auth/verify-phone/', { phone, code: otp });

       // Assuming successful verification returns tokens and user data
       const { access, refresh, user: userData } = response.data;

       localStorage.setItem('auth_token', access);
       localStorage.setItem('refresh_token', refresh);
       setUser(userData); // Set user state
       setTempUserForVerification(null); // Clear temp state
       setLoading(false);
       return true; // Indicate success
     } catch (error) {
       console.error('OTP verification error:', error);
       setLoading(false);
        // throw error; // Re-throw for AuthForm to catch
       return false; // Indicate failure
     }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      verifyOtp,
      logout,
      loading // Exposed as loading
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