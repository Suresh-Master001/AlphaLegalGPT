import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiLoader, FiArrowLeft, FiCheck } from 'react-icons/fi';

/**
 * OTP Verification Modal Component
 * @param {Object} props
 * @param {string} props.email - User email address
 * @param {Function} props.onVerify - OTP verification callback
 * @param {Function} props.onResend - OTP resend callback
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.t - Translation function
 */
const OTPModal = ({ email, onVerify, onResend, isLoading, error, t }) => {
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input on mount so user can type immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  /**
   * Verify OTP
   */
  const handleVerify = useCallback(() => {
    if (otp.length === 6 && !isLoading) {
      onVerify(otp);
    }
  }, [otp, isLoading, onVerify]);

  /**
   * Handle input change - only allow digits, max 6
   */
  const handleChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    if (value.length === 6) {
      // Auto-verify when all 6 digits are entered
      setTimeout(() => {
        if (inputRef.current) inputRef.current.blur();
        onVerify(value);
      }, 300);
    }
  }, [onVerify]);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && otp.length === 6) {
      handleVerify();
    }
  }, [otp, handleVerify]);

  /**
   * Handle resend OTP
   */
  const handleResendClick = useCallback(async () => {
    if (canResend && !isLoading) {
      setCanResend(false);
      setResendTimer(60);
      setOtp('');
      await onResend();
    }
  }, [canResend, isLoading, onResend]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="w-full max-w-3xl"
    >
      {/* Header - Landscape Layout */}
      <div className="flex flex-row items-center gap-4 mb-8">
        {/* Icon */}
        <motion.div 
          className="shrink-0 w-14 h-14 bg-gradient-to-br from-accent to-teal-500 rounded-xl flex items-center justify-center shadow-lg"
          animate={{ rotate: isLoading ? 360 : 0 }}
          transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" }}
        >
          <FiLoader className="w-7 h-7 text-white animate-spin" />
        </motion.div>

        {/* Title and Email */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white mb-0.5">
            {t('verifyOTP') || 'Verify OTP'}
          </h2>
          <p className="text-white/60 text-xs">
            {t('otpSentTo') || 'We sent a 6-digit code to'}
          </p>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 inline-flex items-center gap-2 mt-1.5">
            <span className="text-emerald-300 font-mono text-xs font-semibold truncate">{email}</span>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-100 text-center text-sm mb-6"
        >
          {error}
        </motion.div>
      )}

      {/* OTP Input Section - Landscape */}
      <div className="space-y-5">
        <div className="flex justify-center">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="------"
            className="w-full max-w-lg h-28 text-6xl font-bold text-center tracking-[0.15em] bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl text-white placeholder-white/20 focus:border-emerald-400 focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Visual digit indicators - Landscape Row */}
        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              animate={{ 
                scale: otp.length === index ? 1.15 : 1,
                y: otp[index] ? -3 : 0
              }}
              className={`w-16 h-24 text-3xl font-bold rounded-xl flex items-center justify-center transition-all duration-200 ${
                otp[index]
                  ? 'bg-emerald-500/30 border-2 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                  : otp.length === index
                    ? 'bg-white/15 border-2 border-emerald-400/60 text-white'
                    : 'bg-white/5 border-2 border-white/10 text-white/30'
              }`}
            >
              {otp[index] || (otp.length === index ? '|' : '')}
            </motion.div>
          ))}
        </div>

        {/* Action Buttons - Side by Side on Desktop */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <motion.button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 h-14 bg-gradient-to-r from-accent to-teal-600 hover:from-accent-hover hover:to-teal-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            type="button"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                {t('verifyOTPBtn') || 'Verify OTP'}
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleResendClick}
            disabled={!canResend || isLoading}
            whileHover={{ scale: 1.02 }}
            className="sm:w-40 h-14 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            type="button"
          >
            {!canResend ? (
              <>
                <span className="font-bold text-emerald-300">{resendTimer}s</span>
              </>
            ) : (
              <>
                <FiArrowLeft className="w-4 h-4" />
                Resend
              </>
            )}
          </motion.button>
        </div>

        {/* Timer text below buttons */}
        {!canResend && (
          <p className="text-center text-white/50 text-xs">
            Resend OTP in <span className="font-bold text-white">{resendTimer}s</span>
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default OTPModal;