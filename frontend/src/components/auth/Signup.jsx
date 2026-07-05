import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLoader, FiCheck, FiArrowLeft } from 'react-icons/fi';

import { useAuth } from '../../contexts/AuthContext';
import OTPModal from './OTPModal';

import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import FormField from './FormField';
import PasswordInput from './PasswordInput';
import PrimaryButton from './PrimaryButton';
import ErrorBox from './ErrorBox';

/**
 * Signup Component
 * @description Handles user registration with OTP verification
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
  const [step, setStep] = useState('form');

  const { signup, verifyOTP, resendOTP } = useAuth();

  /**
   * Validate form data
   * @returns {Object} Validation result
   */
  const validateForm = useCallback(() => {
    if (formData.password !== formData.confirmPassword) {
      return {
        valid: false,
        error: t('passwordsMismatch') || 'Passwords do not match',
        type: 'validation'
      };
    }
    
    if (formData.password.length < 6) {
      return {
        valid: false,
        error: 'Password must be at least 6 characters',
        type: 'validation'
      };
    }
    
    if (formData.name.trim().length < 2) {
      return {
        valid: false,
        error: 'Name must be at least 2 characters',
        type: 'validation'
      };
    }
    
    return { valid: true };
  }, [formData, t]);

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

  /**
   * Get user-friendly error message
   * @param {Error} err - Error object
   * @returns {Object} Error message and type
   */
  const getSignupError = useCallback((err) => {
    const errorType = err.type || 'signup_error';
    
    switch (errorType) {
      case 'validation_error':
        return {
          message: err.message || 'Please check your input',
          type: 'validation'
        };
      case 'duplicate_error':
        return {
          message: 'Email already registered. Please login instead.',
          type: 'duplicate'
        };
      case 'email_error':
        return {
          message: 'Failed to send verification email. Please try again.',
          type: 'email'
        };
      case 'service_unavailable':
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          type: 'service'
        };
      default:
        return {
          message: err.message || t('signupError') || 'Signup failed. Please try again.',
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
    
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error);
      setErrorType(validation.type);
      return;
    }

    setIsLoading(true);
    setError('');
    setErrorType('');

    try {
      const result = await signup(formData.name, formData.email, formData.password);
      
      if (result.requiresVerification) {
        // Store OTP for display if email failed (development mode)
        if (result.otp) {
          console.log('OTP for testing:', result.otp);
          setError(`Email delivery may be delayed. OTP: ${result.otp}`);
          setErrorType('email');
        }
        setStep('otp');
      }
    } catch (err) {
      const { message, type } = getSignupError(err);
      setError(message);
      setErrorType(type);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle OTP verification
   * @param {string} otp - 6-digit OTP
   */
  const handleOTPVerify = async (otp) => {
    setIsLoading(true);
    setError('');
    
    try {
      await verifyOTP(formData.email, otp);
      navigate('/chat', { replace: true });
    } catch (err) {
      const errorMessage = err.canResend 
        ? `${err.message} You can request a new OTP.`
        : err.message || 'Invalid OTP';
      setError(errorMessage);
      setErrorType(err.type || 'otp_error');
      console.error('OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle OTP resend
   */
  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await resendOTP(formData.email);
    } catch (err) {
      const errorMessage = err.remainingTime 
        ? `Please wait ${err.remainingTime} seconds before requesting a new OTP`
        : err.message || 'Failed to resend OTP';
      setError(errorMessage);
      setErrorType(err.type || 'resend_error');
      console.error('Resend OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Go back to signup form
   */
  const handleBackToForm = useCallback(() => {
    setStep('form');
    setError('');
    setErrorType('');
  }, []);

  const isFormValid = useMemo(() => {
    return formData.name.trim() && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           formData.password === formData.confirmPassword;
  }, [formData]);

  return (
    <AuthLayout
      title={t('createAccount') || 'Create Account'}
      subtitle={t('signupSubtitle') || 'Create your account in seconds'}
    >
      <AuthCard>
        {step === 'form' && (
          <>
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
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoComplete="name"
                    className="w-full h-14 pl-12 pr-4 bg-white-10 backdrop-blur-sm border border-white-20 rounded-2xl text-white placeholder-white-40 focus:border-emerald-400 focus:outline-none transition-all duration-300 text-base font-semibold"
                    placeholder={t('enterFullName') || 'Enter your full name'}
                    disabled={isLoading}
                  />
                </div>
              </FormField>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordInput
                  label={t('password') || 'Password'}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder={t('createPassword') || 'Create password'}
                  disabled={isLoading}
                  minLength={6}
                />

                <PasswordInput
                  label={t('confirmPassword') || 'Confirm Password'}
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder={t('confirmPassword') || 'Confirm password'}
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <PrimaryButton 
                type="submit" 
                isLoading={isLoading} 
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    {t('creatingAccount') || 'Creating Account...'}
                  </>
                ) : (
                  <>
                    <FiCheck className="w-5 h-5" />
                    {t('createAccountBtn') || 'Create Account'}
                  </>
                )}
              </PrimaryButton>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <span className="text-white/60 text-sm">{t('alreadyHaveAccount') || 'Already have an account?'} </span>
              <Link 
                to="/login" 
                className="text-emerald-300 font-medium hover:text-emerald-200 transition-colors"
              >
                {t('signIn') || 'Sign in'}
              </Link>
            </div>
          </>
        )}

        {step === 'otp' && (
          <div>
            <div className="mb-4">
              <button
                type="button"
                onClick={handleBackToForm}
                className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1"
                disabled={isLoading}
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to form
              </button>
            </div>
            <OTPModal
              email={formData.email}
              onVerify={handleOTPVerify}
              onResend={handleResendOTP}
              isLoading={isLoading}
              error={error}
              t={t}
            />
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;