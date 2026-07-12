import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLoader, FiEye, FiEyeOff, FiLock, FiArrowUpRight } from 'react-icons/fi';

import { useAuth } from '../../contexts/AuthContext';
import ForgotPasswordModal from '../modals/ForgotPasswordModal';

import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import PrimaryButton from './PrimaryButton';
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

  return (
    <AuthLayout
      title={t('welcomeBack') || 'Welcome Back'}
      subtitle={t('loginSubtitle') || 'Sign in to your AlphaLegalGPT account'}
    >
      <AuthCard>
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center justify-center mb-4"
          >
            <div className="w-16 h-16">
              <img src="/AlphaLegalGPT_Logo.png" alt="AlphaLegalGPT Logo" />
            </div>
          </motion.div>
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-display font-bold bg-gradient-to-r from-[#2541D6] via-[#6B21D9] to-[#8B5CF6] bg-clip-text text-transparent mb-2"
          >
            {t('welcomeBack') || 'Welcome Back'}
          </motion.h2>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#5C6178] text-sm font-body"
          >
            {t('loginSubtitle') || 'Sign in to your AlphaLegalGPT account'}
          </motion.p>
        </div>

        {error && errorType === 'verification' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <ErrorBox message={error} type="warning" actionText="Resend OTP" onAction={() => {}} />
          </motion.div>
        )}
        
        {error && errorType !== 'verification' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <ErrorBox message={error} type={errorType === 'rate_limit' ? 'warning' : 'error'} />
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="space-y-5"
        >
          <div className="space-y-2">
            <label className="block text-[#0B0D1C] text-sm font-body font-medium">
              {t('email') || 'Email'}
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0B4] w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                className="w-full h-12 pl-12 pr-4 bg-white border border-[#E7E9F3] rounded-xl text-[#0B0D1C] placeholder-[#9AA0B4] focus:border-[#2541D6] focus:outline-none transition-all duration-300 font-body text-base"
                placeholder={t('enterEmail') || 'Enter your email'}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[#0B0D1C] text-sm font-body font-medium">
              {t('password') || 'Password'}
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0B4] w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder={t('enterPassword') || 'Enter your password'}
                disabled={isLoading}
                className="w-full h-12 pl-12 pr-12 bg-white border border-[#E7E9F3] rounded-xl text-[#0B0D1C] placeholder-[#9AA0B4] focus:border-[#2541D6] focus:outline-none transition-all duration-300 font-body text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA0B4] hover:text-[#0B0D1C] transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-6 bg-white border border-[#E7E9F3] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2541D6]/30 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#5C6178] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#2541D6] peer-checked:to-[#6B21D9]" />
              </div>
              <span className="text-sm text-[#5C6178] font-body group-hover:text-[#0B0D1C] transition-colors">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-sm font-body font-medium text-[#2541D6] hover:text-[#1e3bb8] transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {t('forgotPassword') || 'Forgot Password?'}
            </button>
          </div>

          <PrimaryButton type="submit" isLoading={isLoading} disabled={isLoading || !isFormValid}>
            {isLoading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                {t('signingIn') || 'Signing in...'}
              </>
            ) : (
              <>
                {t('signIn') || 'Sign In'}
                <FiArrowUpRight className="w-5 h-5" />
              </>
            )}
          </PrimaryButton>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E7E9F3]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#9AA0B4] font-mono text-[11px] uppercase tracking-wide">or</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-[#5C6178] text-sm font-body">{t('noAccount') || "Don't have an account?"} </span>
            <Link 
              to="/signup" 
              className="text-[#2541D6] font-body font-semibold hover:text-[#1e3bb8] transition-colors"
            >
              {t('signUp') || 'Sign up'}
            </Link>
          </div>
        </motion.div>
      </AuthCard>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </AuthLayout>
  );
};

export default Login;