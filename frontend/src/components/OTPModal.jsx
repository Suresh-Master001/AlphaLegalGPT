import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLoader, FiArrowLeft, FiCopy } from 'react-icons/fi';

const OTPModal = ({ email, onVerify, onResend, isLoading, error, t }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (e, index) => {
const value = e.target.value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newOtp = pasted.padEnd(6, '').split('').slice(0, 6);
    setOtp(newOtp);
    if (newOtp[5]) {
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = () => {
    if (otp.join('').length === 6 && !isLoading) {
      onVerify();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
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
          <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <FiCopy className="w-4 h-4 text-white/70" />
          </button>
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
        <div className="flex gap-3 justify-center">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={el => inputRefs.current[index] = el}
              value={digit}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-14 h-16 text-2xl font-bold text-center bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl focus:border-accent focus:outline-none focus:shadow-glow transition-all duration-300 hover:border-white/40"
              maxLength={1}
              disabled={isLoading}
            />
          ))}
        </div>

        <motion.button
          onClick={handleVerify}
          disabled={otp.join('').length !== 6 || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            onClick={onResend}
            disabled={!canResend || isLoading}
            whileHover={{ scale: 1.02 }}
            className="text-accent hover:text-accent/80 font-medium flex items-center gap-1 mx-auto transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {!canResend ? (
              <>
                Resend OTP in <span className="font-bold text-white">{resendTimer}s</span>
              </>
            ) : (
              <>
                <FiArrowLeft className="w-4 h-4 -rotate-180" />
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

