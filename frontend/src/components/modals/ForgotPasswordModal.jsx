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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-8 z-10"
          >
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                {step === 1 ? 'Reset Password' : 'Enter New Password'}
              </h2>
              <p className="text-white/60 text-sm">
                {step === 1 
                  ? "Enter your registered email address and we'll send you an OTP."
                  : `We sent a verification code to ${email}`}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-2xl mb-6 text-sm text-center">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-100 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center justify-center gap-2">
                <FiCheckCircle className="w-5 h-5" />
                {success}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-accent focus:outline-none transition-all duration-300 text-lg"
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 bg-gradient-to-r from-accent to-teal-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="Enter 6-digit OTP"
                    className="w-full h-14 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-mono tracking-widest text-center text-xl placeholder-white/40 focus:border-accent focus:outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-accent focus:outline-none transition-all duration-300 text-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                      className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-accent focus:outline-none transition-all duration-300 text-lg"
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 bg-gradient-to-r from-accent to-teal-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
