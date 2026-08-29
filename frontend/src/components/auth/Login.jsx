import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '../../contexts/AuthContext';
import ForgotPasswordModal from '../modals/ForgotPasswordModal';

import SplitAuthLayout, { WelcomePanel, FormPanel } from './SplitAuthLayout';
import ErrorBox from './ErrorBox';

/**
 * Login Component - High-Tech Light Theme
 * @description Handles user authentication with email and password
 */
const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const getErrorMessage = useCallback((err) => {
    const errorType = err.type || 'login_error';
    switch (errorType) {
      case 'validation_error': return { message: err.message || 'Please check your input', type: 'validation' };
      case 'auth_error': return { message: 'Invalid email or password', type: 'auth' };
      case 'verification_required': return { message: 'Please verify your email before logging in', type: 'verification' };
      case 'rate_limited': return { message: err.message || 'Too many attempts. Please try again later.', type: 'rate_limit' };
      default: return { message: err.message || 'Login failed. Please try again.', type: 'general' };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');
    setErrorType('');

    try {
      await login(formData.email, formData.password);
      navigate('/chat', { replace: true });
    } catch (err) {
      const { message, type } = getErrorMessage(err);
      setError(message);
      setErrorType(type);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) { setError(''); setErrorType(''); }
  }, [error]);

  const isFormValid = formData.email && formData.password;

  const inputClasses = "glass-input w-full h-12 pl-4 pr-11 border rounded-xl text-[#0F1229] text-base sm:text-sm";

  return (
    <SplitAuthLayout>
      <WelcomePanel
        title="Create Account"
        description="New here? Sign up to start your legal intelligence journey today."
        ctaText="SIGN UP"
        ctaLink="/signup"
      />

      <FormPanel>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="gradient-text text-2xl md:text-[28px] font-bold tracking-tight mb-1">
            Sign in
          </h1>
          <p className="text-[#5B5F73] text-sm mb-8">
            Welcome back! Please sign in to continue.
          </p>

          <ErrorBox message={error} type={errorType === 'rate_limit' ? 'warning' : errorType === 'verification' ? 'warning' : 'error'} actionText={errorType === 'verification' ? 'Resend OTP' : undefined} onAction={errorType === 'verification' ? () => {} : undefined} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <label htmlFor="login-email" className="block text-[#5B5F73] text-xs font-medium mb-1.5">
                E-mail Address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                placeholder="john@example.com"
                className={inputClasses}
              />
              <span className="material-symbols-outlined absolute right-3.5 bottom-3 text-[#9AA0B4] text-[18px]">
                mail
              </span>
            </div>

            <div className="relative">
              <label htmlFor="login-password" className="block text-[#5B5F73] text-xs font-medium mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
                disabled={isLoading}
                placeholder="Enter your password"
                className={inputClasses}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 bottom-3 text-[#9AA0B4] hover:text-[#0F1229] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#C4C8D8] text-[#2541D6] focus:ring-[#2541D6]/30" />
                <span className="text-xs text-[#5B5F73]">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs font-medium text-[#2541D6] hover:text-[#1e3bb8] transition-colors disabled:opacity-50 py-1.5 -my-1.5"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            <div className="mt-3">
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full h-12 md:h-11 bg-[#2541D6] text-white text-sm font-semibold rounded-xl hover:bg-[#1e3bb8] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-[#9AA0B4] mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#2541D6] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </FormPanel>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </SplitAuthLayout>
  );
};

export default Login;