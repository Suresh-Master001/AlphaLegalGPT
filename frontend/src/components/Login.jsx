import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLoader, FiAlertCircle } from 'react-icons/fi';

import { useAuth } from '../contexts/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

import AuthLayout from './auth/AuthLayout';
import AuthCard from './auth/AuthCard';
import FormField from './auth/FormField';
import PasswordInput from './auth/PasswordInput';
import PrimaryButton from './auth/PrimaryButton';
import ErrorBox from './auth/ErrorBox';

/**
 * Login Component
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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Get user-friendly error message based on error type
   * @param {Error} err - Error object
   * @returns {Object} Error message and type
   */
  const getErrorMessage = useCallback((err) => {
    const errorType = err.type || 'login_error';
    
    switch (errorType) {
      case 'validation_error':
        return {
          message: err.message || 'Please check your input',
          type: 'validation'
        };
      case 'auth_error':
        return {
          message: 'Invalid email or password',
          type: 'auth'
        };
      case 'verification_required':
        return {
          message: 'Please verify your email before logging in',
          type: 'verification'
        };
      case 'rate_limited':
        return {
          message: err.message || 'Too many attempts. Please try again later.',
          type: 'rate_limit'
        };
      default:
        return {
          message: err.message || t('invalidCredentials') || 'Login failed. Please try again.',
          type: 'general'
        };
    }
  }, [t]);

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
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

  /**
   * Handle input changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
      setErrorType('');
    }
  }, [error]);

  const isFormValid = formData.email && formData.password;

  return (
    <AuthLayout
      title={t('welcomeBack') || 'Welcome Back'}
      subtitle={t('loginSubtitle') || 'Sign in to your AlphaLegalGPT account'}
    >
      <AuthCard>
        {error && errorType === 'verification' && (
          <ErrorBox 
            message={error} 
            type="warning"
            actionText="Resend OTP"
            onAction={() => {
              // Could trigger resend here if needed
            }}
          />
        )}
        
        {error && errorType !== 'verification' && (
          <ErrorBox 
            message={error} 
            type={errorType === 'rate_limit' ? 'warning' : 'error'}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label={t('email') || 'Email'} icon={FiMail}>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white-40 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                className="w-full h-14 pl-12 pr-4 bg-white-10 backdrop-blur-sm border border-white-20 rounded-2xl text-white placeholder-white-40 focus:border-emerald-400 focus:outline-none transition-all duration-300 text-base font-semibold"
                placeholder={t('enterEmail') || 'Enter your email'}
                disabled={isLoading}
              />
            </div>
          </FormField>

          <PasswordInput
            label={t('password') || 'Password'}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder={t('enterPassword') || 'Enter your password'}
            disabled={isLoading}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-sm font-medium text-emerald-300 hover:text-emerald-200 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {t('forgotPassword') || 'Forgot Password?'}
            </button>
          </div>

          <PrimaryButton 
            type="submit" 
            isLoading={isLoading} 
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                {t('signingIn') || 'Signing in...'}
              </>
            ) : (
              t('signIn') || 'Sign In'
            )}
          </PrimaryButton>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <span className="text-white/60 text-sm">{t('noAccount') || "Don't have an account?"} </span>
          <Link 
            to="/signup" 
            className="text-emerald-300 font-medium hover:text-emerald-200 transition-colors"
          >
            {t('signUp') || 'Sign up'}
          </Link>
        </div>
      </AuthCard>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </AuthLayout>
  );
};

export default Login;
