import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser, verifyOTP as verifyOTPApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Mock user - replace with real API call
      setUser({ email: 'user@example.com', name: 'Demo User' });
      setToken(token);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { token } = await loginUser(email, password);
      localStorage.setItem('authToken', token);
      setToken(token);
      setUser({ email });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const signup = async (name, email, password) => {
    try {
      const result = await signupUser(name, email, password);
      return { success: true, ...result };
    } catch (error) {
      throw new Error('Signup failed');
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const { token } = await verifyOTPApi(email, otp.join(''));
      localStorage.setItem('authToken', token);
      setToken(token);
      setUser({ email });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw new Error('OTP verification failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    signup,
    verifyOTP,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

