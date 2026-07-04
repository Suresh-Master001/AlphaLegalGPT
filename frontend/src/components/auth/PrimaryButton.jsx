import React from 'react';
import { motion } from 'framer-motion';

const PrimaryButton = ({ children, isLoading, onClick, type = 'submit', disabled }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </motion.button>
  );
};

export default PrimaryButton;

