import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLoader, FiCheck } from 'react-icons/fi';

import { useAuth } from '../../contexts/AuthContext';

import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import FormField from './FormField';
import PasswordInput from './PasswordInput';
import PrimaryButton from './PrimaryButton';
import ErrorBox from './ErrorBox';

/**
 * Signup Component
 * @description Handles user registration (direct login - no OTP)
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

  /**
   * Validate form data
   */
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
        {error && (
          <ErrorBox 
            message={error} 
            type={errorType === 'duplicate' ? 'warning' : 'error'}
            actionText={errorType === 'duplicate' ? 'Go to Login' : undefined}
            onAction={errorType === 'duplicate' ? () => navigate('/login') : undefined}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label={t('fullName') || 'Full Name'} icon={FiUser}>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white-40 w-5 h-5" />
              <input
                type="text" name="name" value={formData.name} onChange={handleInputChange}
                required autoComplete="name" disabled={isLoading}
                className="w-full h-14 pl-12 pr-4 bg-white-10 backdrop-blur-sm border border-white-20 rounded-2xl text-white placeholder-white-40 focus:border-emerald-400 focus:outline-none transition-all duration-300 text-base font-semibold"
                placeholder={t('enterFullName') || 'Enter your full name'}
              />
            </div>
          </FormField>

          <FormField label={t('email') || 'Email'} icon={FiMail}>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white-40 w-5 h-5" />
              <input
                type="email" name="email" value={formData.email} onChange={handleInputChange}
                required autoComplete="email" disabled={isLoading}
                className="w-full h-14 pl-12 pr-4 bg-white-10 backdrop-blur-sm border border-white-20 rounded-2xl text-white placeholder-white-40 focus:border-emerald-400 focus:outline-none transition-all duration-300 text-base font-semibold"
                placeholder={t('enterEmail') || 'Enter your email'}
              />
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              label={t('password') || 'Password'} showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              name="password" value={formData.password} onChange={handleInputChange}
              required disabled={isLoading} minLength={6}
              placeholder={t('createPassword') || 'Create password'}
            />
            <PasswordInput
              label={t('confirmPassword') || 'Confirm Password'} showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
              required disabled={isLoading} minLength={6}
              placeholder={t('confirmPassword') || 'Confirm password'}
            />
          </div>

          <PrimaryButton type="submit" isLoading={isLoading} disabled={isLoading || !isFormValid}>
            {isLoading ? <><FiLoader className="w-5 h-5 animate-spin" /> {t('creatingAccount') || 'Creating Account...'} </> : <><FiCheck className="w-5 h-5" /> {t('createAccountBtn') || 'Create Account'} </>}
          </PrimaryButton>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <span className="text-white/60 text-sm">{t('alreadyHaveAccount') || 'Already have an account?'} </span>
          <Link to="/login" className="text-emerald-300 font-medium hover:text-emerald-200 transition-colors">
            {t('signIn') || 'Sign in'}
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;