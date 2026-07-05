import React from 'react';
import { motion } from 'framer-motion';

const AuthCard = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="bg-white-10 backdrop-blur-xl border border-white-20 shadow-2xl rounded-3xl p-8 relative"
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-white-20 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1 }}
      />
      {children}
    </motion.div>
  );
};

export default AuthCard;