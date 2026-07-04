import React from 'react';
import { motion } from 'framer-motion';

const ErrorBox = ({ message }) => {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-100 text-sm"
    >
      {message}
    </motion.div>
  );
};

export default ErrorBox;