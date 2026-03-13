import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import OTPModal from './OTPModal'; // Will create later

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form', 'otp'
  const { verifyOTP } = useAuth();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsMismatch') || 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Step 1: Send signup with OTP
      await signup(formData.name, formData.email, formData.password);
      setStep('otp');
    } catch (err) {
      setError(t('signupError') || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    setIsLoading(true);
    try {
      // Verify OTP
      await verifyOTP(formData.email, otpData.join(''));
      navigate('/'); 
    } catch (err) {
      setError('Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    // Resend logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900/30 to-slate-900 flex items-center justify-center p-2 relative overflow-hidden">
      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30"
            animate={{
              x: [0, 120, 0],
              y: [0, 60, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 12 + i * 0.5, repeat: Infinity }}
            style={{ left: `${i * 4.5}%`, top: `${i * 6}%` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/5 backdrop-blur-3xl border border-white/15 shadow-2xl rounded-3xl p-10 relative overflow-hidden"
        >
          {/* Gradient border effect */}
        <div className="text-center">
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-3">
              {t('createAccount') || 'Create Account'}
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/20 border-2 border-red-500/40 rounded-2xl p-5 mb-4 backdrop-blur-sm text-red-100 font-medium flex items-center gap-3"
                  >
                    <FiCheck className="text-red-400 w-6 h-6 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white/90 text-base font-semibold mb-2 flex items-center gap-2">
                      <FiUser className="w-5 h-5" />
                      {t('fullName') || 'Full Name'}
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02, borderColor: '#10a37f' }}
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full h-16 px-5 bg-white/5 backdrop-blur-lg border-2 border-white/15 hover:border-white/30 rounded-2xl text-white text-lg placeholder-white/40 font-semibold focus:border-accent focus:outline-none transition-all duration-400"
                      placeholder={t('enterFullName') || 'Enter your full name'}
                    />
                  </div>

                  <div>
                    <label className="block text-white/90 text-base font-semibold mb-2 flex items-center gap-2">
                      <FiMail className="w-5 h-5" />
                      {t('email') || 'Email'}
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full h-16 px-5 bg-white/5 backdrop-blur-lg border-2 border-white/15 hover:border-white/30 rounded-2xl text-white text-lg placeholder-white/40 font-semibold focus:border-accent focus:outline-none transition-all duration-400"
                      placeholder={t('enterEmail') || 'Enter your email'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/90 text-base font-semibold mb-2 flex items-center gap-2">
                        <FiLock className="w-5 h-5" />
                        {t('password') || 'Password'}
                      </label>
                      <div className="relative">
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="w-full h-16 pl-5 pr-12 bg-white/5 backdrop-blur-lg border-2 border-white/15 hover:border-white/30 rounded-2xl text-white text-lg placeholder-white/40 font-semibold focus:border-accent focus:outline-none transition-all duration-400"
                          placeholder={t('createPassword') || 'Create password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1 transition-all"
                        >
                          {showPassword ? <FiEye className="w-6 h-6" /> : <FiEyeOff className="w-6 h-6" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/90 text-base font-semibold mb-2 flex items-center gap-2">
                        <FiLock className="w-5 h-5" />
                        {t('confirmPassword') || 'Confirm Password'}
                      </label>
                      <div className="relative">
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full h-16 pl-5 pr-12 bg-white/5 backdrop-blur-lg border-2 border-white/15 hover:border-white/30 rounded-2xl text-white text-lg placeholder-white/40 font-semibold focus:border-accent focus:outline-none transition-all duration-400"
                          placeholder={t('confirmPassword') || 'Confirm password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1 transition-all"
                        >
                          {showConfirmPassword ? <FiEye className="w-6 h-6" /> : <FiEyeOff className="w-6 h-6" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={isLoading ? {} : { scale: 1.05 }}
                    whileTap={isLoading ? {} : { scale: 0.98 }}
                    className="w-full h-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xl font-black rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="w-6 h-6 animate-spin" />
                        {t('creatingAccount') || 'Creating Account...'}
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-6 h-6" />
                        {t('createAccountBtn') || 'Create Account'}
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                  <span className="text-white/60 text-sm">
                    {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
                  </span>
                  <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                    {t('signIn') || 'Sign in'}
                  </Link>
                </div>
              </>
            )}

            {step === 'otp' && (
              <OTPModal
                email={formData.email}
                onVerify={handleOTPVerify}
                onResend={handleResendOTP}
                isLoading={isLoading}
                error={error}
                t={t}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;

