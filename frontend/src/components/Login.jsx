import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLoader } from 'react-icons/fi';

import { useAuth } from '../contexts/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

import AuthLayout from './auth/AuthLayout';
import AuthCard from './auth/AuthCard';
import FormField from './auth/FormField';
import TextInput from './auth/TextInput';
import PasswordInput from './auth/PasswordInput';
import PrimaryButton from './auth/PrimaryButton';
import ErrorBox from './auth/ErrorBox';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/chat');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/chat');
    } catch (err) {
      setError(t('invalidCredentials') || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AuthLayout
      title={t('welcomeBack') || 'Welcome Back'}
      subtitle={t('loginSubtitle') || 'Sign in to your AlphaLegalGPT account'}
    >
      <AuthCard>
        <ErrorBox message={error} />

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
                className="w-full h-14 pl-12 pr-4 bg-white-10 backdrop-blur-sm border border-white-20 rounded-2xl text-white placeholder-white-40 focus:border-emerald-400 focus:outline-none transition-all duration-300 text-base font-semibold"
                placeholder={t('enterEmail') || 'Enter your email'}
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
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-sm font-medium text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              {t('forgotPassword') || 'Forgot Password?'}
            </button>
          </div>

          <PrimaryButton type="submit" isLoading={isLoading} disabled={isLoading}>
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
          <Link to="/signup" className="text-emerald-300 font-medium hover:text-emerald-200 transition-colors">
            {t('signUp') || 'Sign up'}
          </Link>
        </div>
      </AuthCard>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </AuthLayout>
  );
};

export default Login;