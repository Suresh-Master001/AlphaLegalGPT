import React from 'react';
import { motion } from 'framer-motion';

const AuthCard = ({ children, showBranding = true }) => {
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
      className="glass-panel-strong card-hover-subtle rounded-2xl p-6 duration-300"
    >
      {children}
      {showBranding && (
        <div className="mt-6 pt-4 border-t border-[#E7E9F3] text-center">
          <p className="text-xs text-[#9AA0B4] font-body">
            Powered by{' '}
            <a href="https://codenxte.com" target="_blank" rel="noopener noreferrer" className="text-[#2541D6] hover:text-[#6B21D9] transition-colors font-medium">
              CodeNxte Web & Software Solutions
            </a>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AuthCard;