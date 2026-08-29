import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '../../contexts/AuthContext';

import SplitAuthLayout, { WelcomePanel, FormPanel } from './SplitAuthLayout';
import ErrorBox from './ErrorBox';

/**
 * Signup Component - Premium Split-Panel Design
 */
const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');

  const { signup } = useAuth();

  const validateForm = useCallback(() => {
    if (formData.name.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters', type: 'validation' };
    }
    if (formData.password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters', type: 'validation' };
    }
    if (!agreeTerms) {
      return { valid: false, error: 'Please agree to the Terms & Conditions', type: 'validation' };
    }
    return { valid: true };
  }, [formData, agreeTerms]);

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

  const inputClasses = "glass-input w-full h-12 pl-4 pr-11 border rounded-xl text-[#0F1229] text-base sm:text-sm";

  return (
    <SplitAuthLayout inverse={true}>
      <FormPanel>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="gradient-text text-2xl md:text-[28px] font-bold tracking-tight mb-1">
            Create your account
          </h1>
          <p className="text-[#5B5F73] text-sm mb-8">
            Start your legal intelligence journey today.
          </p>

          <ErrorBox message={error} type={errorType} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <label htmlFor="name" className="block text-[#5B5F73] text-xs font-medium mb-1.5">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                autoComplete="name"
                autoCapitalize="words"
                disabled={isLoading}
                placeholder="John Doe"
                className={inputClasses}
              />
              <span className="material-symbols-outlined absolute right-3.5 bottom-3 text-[#9AA0B4] text-[18px]">
                person
              </span>
            </div>

            <div className="relative">
              <label htmlFor="email" className="block text-[#5B5F73] text-xs font-medium mb-1.5">
                E-mail Address
              </label>
              <input
                id="email"
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
              <label htmlFor="password" className="block text-[#5B5F73] text-xs font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
                disabled={isLoading}
                placeholder="Min. 6 characters"
                minLength={6}
                className={inputClasses}
              />
              <span className="material-symbols-outlined absolute right-3.5 bottom-3 text-[#9AA0B4] text-[18px]">
                lock
              </span>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#C4C8D8] text-[#2541D6] focus:ring-[#2541D6]/30 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#5B5F73] cursor-pointer leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-[#2541D6] font-medium hover:underline">
                  Terms &amp; Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#2541D6] font-medium hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="mt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 md:h-11 bg-[#2541D6] text-white text-sm font-semibold rounded-xl hover:bg-[#1e3bb8] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign Up
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-[#9AA0B4] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2541D6] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </FormPanel>

      <WelcomePanel
        title="Welcome Back"
        description="To keep connected with us, please sign in with your personal info."
        ctaText="SIGN IN"
        ctaLink="/login"
      />
    </SplitAuthLayout>
  );
};

export default Signup;