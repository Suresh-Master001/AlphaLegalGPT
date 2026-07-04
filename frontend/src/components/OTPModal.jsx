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
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
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
   * Handle OTP input change
   * @param {Event} e - Input change event
   * @param {number} index - Input index
   */
  const handleOtpChange = useCallback((e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 10);
    }
  }, [otp]);

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   * @param {number} index - Input index
   */
  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  }, [otp]);

  /**
   * Handle paste event for OTP
   * @param {ClipboardEvent} e - Paste event
   */
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = String(e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0, 6);
    const newOtp = pasted.padEnd(6, '').split('').slice(0, 6);
    setOtp(newOtp);
    // Focus last filled input or last input
    const focusIndex = Math.min(pasted.length, 5);
    setTimeout(() => inputRefs.current[focusIndex]?.focus(), 10);
  }, []);

  /**
   * Verify OTP
   */
  const handleVerify = useCallback(() => {
    const otpValue = otp.join('');
    if (otpValue.length === 6 && !isLoading) {
      onVerify(otpValue);
    }
  }, [otp, isLoading, onVerify]);

  /**
   * Handle resend OTP
   */
  const handleResendClick = useCallback(async () => {
    if (canResend && !isLoading) {
      setCanResend(false);
      setResendTimer(60);
      await onResend();
    }
  }, [canResend, isLoading, onResend]);

  // Memoized OTP input component for better performance
  const OTPInput = React.memo(({ digit, index }) => (
    <motion.input
      key={index}
      ref={el => inputRefs.current[index] = el}
      value={digit}
      onChange={(e) => handleOtpChange(e, index)}
      onKeyDown={(e) => handleKeyDown(e, index)}
      onPaste={index === 0 ? handlePaste : undefined}
      className="w-14 h-16 text-2xl font-bold text-center bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl focus:border-accent focus:outline-none focus:shadow-glow transition-all duration-300 hover:border-white/40"
      maxLength={1}
      disabled={isLoading}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      aria-label={`OTP digit ${index + 1}`}
    />
  ));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div 
          className="mx-auto w-20 h-20 bg-gradient-to-br from-accent to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
          animate={{ rotate: isLoading ? 360 : 0 }}
          transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" }}
        >
          <FiLoader className="w-10 h-10 text-white animate-spin" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('verifyOTP') || 'Verify OTP'}
        </h2>
        <p className="text-white/70 text-lg mb-1">
          {t('otpSentTo') || 'We sent a 6-digit code to'}
        </p>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 inline-flex items-center gap-2 mb-8 max-w-sm mx-auto">
          <span className="text-white font-mono text-sm truncate flex-1">{email}</span>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-red-100 text-center"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-6">
        <div className="flex gap-3 justify-center" role="group" aria-label="OTP input">
          {otp.map((digit, index) => (
            <OTPInput 
              key={index} 
              digit={digit} 
              index={index} 
            />
          ))}
        </div>

        <motion.button
          onClick={handleVerify}
          disabled={otp.join('').length !== 6 || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 bg-gradient-to-r from-accent to-teal-600 hover:from-accent-hover hover:to-teal-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        <div className="text-center">
          <motion.button
            onClick={handleResendClick}
            disabled={!canResend || isLoading}
            whileHover={{ scale: 1.02 }}
            className="text-accent hover:text-accent/80 font-medium flex items-center gap-1 mx-auto transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            type="button"
          >
            {!canResend ? (
              <>
                Resend OTP in <span className="font-bold text-white">{resendTimer}s</span>
              </>
            ) : (
              <>
                <FiArrowLeft className="w-4 h-4" />
                Resend OTP
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default OTPModal;

