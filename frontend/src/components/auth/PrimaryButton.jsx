import React from 'react';
import { motion } from 'framer-motion';

const PrimaryButton = ({ children, isLoading, onClick, type = 'submit', disabled }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: isLoading ? 1 : 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="w-full h-12 bg-gradient-to-r from-[#3E63FF] via-[#8B3FE8] to-[#E23FA0] text-white font-body font-semibold text-base rounded-full flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(139,63,232,0.35)] hover:shadow-[0_12px_40px_rgba(139,63,232,0.45)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </motion.button>
  );
};

export default PrimaryButton;