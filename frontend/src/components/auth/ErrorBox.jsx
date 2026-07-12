import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';

const ErrorBox = ({ message, type = 'error', actionText, onAction }) => {
  if (!message) return null;

  const isWarning = type === 'warning';
  // Aurora Glass: keep it frosted + use only aurora tokens.
  const accentBorder = isWarning ? 'border-white/90' : 'border-white/90';
  const accentText = isWarning ? 'text-[#8B3FE8]' : 'text-[#E23FA0]';
  const iconColor = isWarning ? 'text-[#8B3FE8]' : 'text-[#E23FA0]';
  const Icon = isWarning ? FiAlertTriangle : FiAlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-center gap-2.5 bg-white/70 backdrop-blur-md ${accentBorder} rounded-full px-4 py-3 mb-6 ${accentText} text-sm font-body border shadow-[0_8px_32px_rgba(62,99,255,0.06)]`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
      <span className="flex-1">{message}</span>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="ml-2 text-xs font-semibold underline decoration-[#8B3FE8] underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default ErrorBox;

