import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({ label, showPassword, onTogglePassword, error, ...props }) => {
  return (
    <div>
      <label className="block text-white-80 text-sm font-medium mb-3 flex items-center gap-2">
        <FiLock className="w-5 h-5" />
        {label}
      </label>
      <motion.div whileFocus={{ scale: 1.02 }} className="relative">
        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white-40 w-5 h-5" />
        <input
          type={showPassword ? 'text' : 'password'}
          {...props}
          className={`
            w-full h-14 pl-12 pr-12 bg-white-10 backdrop-blur-sm border rounded-2xl 
            text-white placeholder-white-40 
            focus:outline-none transition-all duration-300 text-base font-semibold
            ${error ? 'border-red-400' : 'border-white-20 focus:border-emerald-400'}
            ${props.className || ''}
          `}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white-40 hover:text-white transition-colors"
        >
          {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
        </button>
      </motion.div>
      {error && <p className="text-red-300 text-xs mt-1.5">{error}</p>}
    </div>
  );
};

export default PasswordInput;