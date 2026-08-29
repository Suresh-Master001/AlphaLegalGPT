import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiX, FiCheckCircle } from 'react-icons/fi';
import { forgotPassword, resetPassword } from '../../services/api';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required');

    setIsLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSuccess('OTP sent to your email.');
      setTimeout(() => {
        setSuccess('');
        setStep(2);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please ensure this email is registered.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) return setError('All fields are required');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');

    setIsLoading(true);
    setError('');
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.25rem] shadow-[0_8px_32px_rgba(62,99,255,0.08)] p-6 z-10"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-[#9B9BB0] hover:text-[#14141F] transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-display font-bold bg-gradient-to-r from-[#3E63FF] via-[#8B3FE8] to-[#E23FA0] bg-clip-text text-transparent mb-2">
                {step === 1 ? 'Reset Password' : 'Enter New Password'}
              </h2>
              <p className="text-[#63637A] text-sm font-body">
                {step === 1
                  ? "Enter your registered email address and we'll send you an OTP."
                  : `We sent a verification code to ${email}`}
              </p>
            </div>

            {error && (
              <div className="bg-white/70 border border-white/90 text-[#E23FA0] px-4 py-3 rounded-full mb-6 text-sm text-center font-body shadow-[0_8px_32px_rgba(62,99,255,0.06)] border">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-white/70 border border-white/90 text-[#8B3FE8] px-4 py-3 rounded-full mb-6 text-sm flex items-center justify-center gap-2 font-body shadow-[0_8px_32px_rgba(62,99,255,0.06)] border">
                <FiCheckCircle className="w-5 h-5" />
                {success}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-[#14141F] text-sm font-body font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BB0] w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="w-full h-12 pl-12 pr-4 bg-white/60 border border-white/80 rounded-[1rem] text-[#14141F] font-body placeholder-[#9B9BB0] focus:border-white/100 focus:outline-none transition-all duration-300 text-base"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 bg-gradient-to-r from-[#3E63FF] via-[#8B3FE8] to-[#E23FA0] text-white font-body font-semibold text-base rounded-full shadow-[0_8px_24px_rgba(139,63,232,0.35)] hover:shadow-[0_12px_40px_rgba(139,63,232,0.45)] transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-[#14141F] text-sm font-body font-medium mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="Enter 6-digit OTP"
                    className="w-full h-12 px-4 bg-white/60 border border-white/80 rounded-[1rem] text-[#14141F] font-mono tracking-widest text-center text-xl font-body placeholder-[#9B9BB0] focus:border-white/100 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-[#14141F] text-sm font-body font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BB0] w-5 h-5" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full h-12 pl-12 pr-4 bg-white/60 border border-white/80 rounded-[1rem] text-[#14141F] font-body placeholder-[#9B9BB0] focus:border-white/100 focus:outline-none transition-all duration-300 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#14141F] text-sm font-body font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BB0] w-5 h-5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                      className="w-full h-12 pl-12 pr-4 bg-white/60 border border-white/80 rounded-[1rem] text-[#14141F] font-body placeholder-[#9B9BB0] focus:border-white/100 focus:outline-none transition-all duration-300 text-base"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 bg-gradient-to-r from-[#3E63FF] via-[#8B3FE8] to-[#E23FA0] text-white font-body font-semibold text-base rounded-full shadow-[0_8px_24px_rgba(139,63,232,0.35)] hover:shadow-[0_12px_40px_rgba(139,63,232,0.45)] transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </form>
            )}

            {/* Powered by caption */}
            <p className="text-center text-xs text-[#9AA0B4] font-body mt-6">
              Powered by{' '}
              <a href="https://codenxte.com" target="_blank" rel="noopener noreferrer" className="text-[#8B3FE8] hover:text-[#3E63FF] transition-colors font-medium">
                CodeNxte Web &amp; Software Solutions
              </a>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;

