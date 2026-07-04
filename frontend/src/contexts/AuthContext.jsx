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

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      
      if (!response.success || !response.token) {
        throw new Error(response.error || 'Login failed');
      }
      
      const { token, user: userData } = response;
      const finalUser = userData || { email };
      
      // Store in sessionStorage for tab-specific session
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(finalUser));
      
      setToken(token);
      setUser(finalUser);
      setIsAuthenticated(true);
      
      return { success: true, user: finalUser };
    } catch (error) {
      // Enhance error with type for better frontend handling
      const enhancedError = new Error(error.message || 'Login failed');
      enhancedError.type = error.type || 'login_error';
      throw enhancedError;
    }
  };

  /**
   * Register new user
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Signup result
   */
  const signup = async (name, email, password) => {
    try {
      const response = await signupUser(name, email, password);
      
      if (!response.success) {
        throw new Error(response.error || 'Signup failed');
      }
      
      return {
        success: true,
        message: response.message,
        email: response.email,
        requiresVerification: response.requiresVerification
      };
    } catch (error) {
      const enhancedError = new Error(error.message || 'Signup failed');
      enhancedError.type = error.type || 'signup_error';
      throw enhancedError;
    }
  };

  /**
   * Verify OTP and activate account
   * @param {string} email - User email
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<Object>} Verification result
   */
  const verifyOTP = async (email, otp) => {
    try {
      const response = await verifyOTPApi(email, otp);
      
      if (!response.success || !response.token) {
        throw new Error(response.error || 'OTP verification failed');
      }
      
      const { token, user: userData } = response;
      const finalUser = userData || { email };
      
      // Store in sessionStorage
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(finalUser));
      
      setToken(token);
      setUser(finalUser);
      setIsAuthenticated(true);
      
      return { 
        success: true, 
        message: response.message,
        user: finalUser 
      };
    } catch (error) {
      const enhancedError = new Error(error.message || 'OTP verification failed');
      enhancedError.type = error.type || 'otp_error';
      enhancedError.canResend = error.canResend || false;
      throw enhancedError;
    }
  };

  /**
   * Resend OTP to email
   * @param {string} email - User email
   * @returns {Promise<Object>} Resend result
   */
  const resendOTP = async (email) => {
    try {
      const response = await resendOTPApi(email);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to resend OTP');
      }
      
      return {
        success: true,
        message: response.message,
        email: response.email
      };
    } catch (error) {
      const enhancedError = new Error(error.message || 'Failed to resend OTP');
      enhancedError.type = error.type || 'resend_error';
      enhancedError.remainingTime = error.remainingTime || 0;
      throw enhancedError;
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

