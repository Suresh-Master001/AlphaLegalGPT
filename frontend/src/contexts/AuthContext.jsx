import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser, verifyOTP as verifyOTPApi, resendOTP as resendOTPApi } from '../services/api';

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
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inactivity Timeout: 30 minutes
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    // Check session storage to strictly persist only per-tab session
    const storedToken = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser({ email: storedUser });
      }
      setIsAuthenticated(true);
    } else {
      // Force logout if invalid, and ensure standard dark theme for Login page
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      document.documentElement.classList.add('dark');
    }
    setLoading(false);
  }, []);

  // Inactivity Tracker
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (isAuthenticated) {
        timeoutId = setTimeout(() => {
          console.log('🚪 Auto-logging out due to 30m inactivity');
          logout();
        }, INACTIVITY_TIMEOUT);
      }
    };

    if (isAuthenticated) {
      // Events to track user activity
      const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });

      // Initial timer start
      resetTimer();

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        events.forEach(event => {
          window.removeEventListener(event, resetTimer);
        });
      };
    }
  }, [isAuthenticated]);

  const login = async (email, password) => {
    try {
      const { token, user: userData } = await loginUser(email, password);
      const finalUser = userData || { email };
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(finalUser));
      setToken(token);
      setUser(finalUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const result = await signupUser(name, email, password);
      return { success: true, ...result };
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const { token, user: userData } = await verifyOTPApi(email, otp);
      const finalUser = userData || { email };
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(finalUser));
      setToken(token);
      setUser(finalUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const resendOTP = async (email) => {
    try {
      const result = await resendOTPApi(email);
      return { success: true, ...result };
    } catch (error) {
      throw error;
    }
  };


  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    // Force standard dark theme for unauthenticated views (Login/Signup)
    document.documentElement.classList.add('dark');
  };

  const value = React.useMemo(() => ({
    user,
    token,
    isAuthenticated,
    loading,
    login,
    signup,
    verifyOTP,
    logout,
    resendOTP,
  }), [user, token, isAuthenticated, loading, login, signup, verifyOTP, logout, resendOTP]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

