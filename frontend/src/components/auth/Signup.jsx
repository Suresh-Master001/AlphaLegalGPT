import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLoader, FiEye, FiEyeOff, FiLock, FiArrowUpRight } from 'react-icons/fi';

import { useAuth } from '../../contexts/AuthContext';

import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import PrimaryButton from './PrimaryButton';
import ErrorBox from './ErrorBox';

/**
 * Signup Component - High-Tech Light Theme
 */
const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');

  const { signup } = useAuth();

  const validateForm = useCallback(() => {
    if (formData.password !== formData.confirmPassword) {
      return { valid: false, error: 'Passwords do not match', type: 'validation' };
    }
    if (formData.password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters', type: 'validation' };
    }
    if (formData.name.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters', type: 'validation' };
    }
    return { valid: true };
  }, [formData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error);
      setErrorType(validation.type);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signup(formData.name, formData.email, formData.password);
      if (result.token) {
        navigate('/chat', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
      setErrorType(err.type || 'signup_error');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = useMemo(() => {
    return formData.name.trim() && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           formData.password === formData.confirmPassword;
  }, [formData]);

  return (
    <AuthLayout title={t('createAccount') || 'Create Account'} subtitle={t('signupSubtitle') || 'Create your account in seconds'}>
      <AuthCard>
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center justify-center mb-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2541D6] to-[#6B21D9] shadow-[0_6px_16px_rgba(107,33,217,0.25)] flex items-center justify-center">
              <FiUser className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-display font-bold bg-gradient-to-r from-[#2541D6] via-[#6B21D9] to-[#8B5CF6] bg-clip-text text-transparent mb-2"
          >
            {t('createAccount') || 'Create Account'}
          </motion.h2>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#5C6178] text-sm font-body"
          >
            {t('signupSubtitle') || 'Create your account in seconds'}
          </motion.p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <ErrorBox 
              message={error} 
              type={errorType === 'duplicate' ? 'warning' : 'error'}
              actionText={errorType === 'duplicate' ? 'Go to Login' : undefined}
              onAction={errorType === 'duplicate' ? () => navigate('/login') : undefined}
            />
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
              {t('fullName') || 'Full Name'}
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0B4] w-5 h-5" />
              <input
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                required 
                autoComplete="name" 
                disabled={isLoading}
                placeholder={t('enterFullName') || 'Enter your full name'}
                className="w-full h-12 pl-12 pr-4 bg-white border border-[#E7E9F3] rounded-xl text-[#0B0D1C] placeholder-[#9AA0B4] focus:border-[#2541D6] focus:outline-none transition-all duration-300 font-body text-base"
              />
            </div>
          </div>

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
                disabled={isLoading}
                placeholder={t('enterEmail') || 'Enter your email'}
                className="w-full h-12 pl-12 pr-4 bg-white border border-[#E7E9F3] rounded-xl text-[#0B0D1C] placeholder-[#9AA0B4] focus:border-[#2541D6] focus:outline-none transition-all duration-300 font-body text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder={t('createPassword') || 'Create password'}
                  disabled={isLoading}
                  minLength={6}
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

            <div className="space-y-2">
              <label className="block text-[#0B0D1C] text-sm font-body font-medium">
                {t('confirmPassword') || 'Confirm Password'}
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0B4] w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder={t('confirmPassword') || 'Confirm password'}
                  disabled={isLoading}
                  minLength={6}
                  className="w-full h-12 pl-12 pr-12 bg-white border border-[#E7E9F3] rounded-xl text-[#0B0D1C] placeholder-[#9AA0B4] focus:border-[#2541D6] focus:outline-none transition-all duration-300 font-body text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA0B4] hover:text-[#0B0D1C] transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-6 bg-white border border-[#E7E9F3] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2541D6]/30 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#5C6178] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#2541D6] peer-checked:to-[#6B21D9]" />
              </div>
              <span className="text-sm text-[#5C6178] font-body group-hover:text-[#0B0D1C] transition-colors">I agree to Terms</span>
            </label>
          </div>

          <PrimaryButton type="submit" isLoading={isLoading} disabled={isLoading || !isFormValid}>
            {isLoading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                {t('creatingAccount') || 'Creating Account...'}
              </>
            ) : (
              <>
                {t('createAccountBtn') || 'Create Account'}
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
            <span className="text-[#5C6178] text-sm font-body">{t('alreadyHaveAccount') || 'Already have an account?'} </span>
            <Link 
              to="/login" 
              className="text-[#2541D6] font-body font-semibold hover:text-[#1e3bb8] transition-colors"
            >
              {t('signIn') || 'Sign in'}
            </Link>
          </div>
        </motion.div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;