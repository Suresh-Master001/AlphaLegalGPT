import React from 'react';
import { motion } from 'framer-motion';

const AuthCard = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{
        y: -5,
        boxShadow: '0 12px 40px rgba(139,63,232,0.25)',
        borderColor: 'rgba(231,233,243,0.8)'
      }}
      className="bg-white border border-[#E7E9F3] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all p-6 duration-300"
    >
      {children}
    </motion.div>
  );
};

export default AuthCard;