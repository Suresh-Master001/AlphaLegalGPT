import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin as FiMapPinIcon 
} from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

const ChatMessage = ({ message, isStreaming }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const isUser = message.role === 'user';
  const isError = message.isError;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} mb-6`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'order-2' : 'order-1'}`}>
        {isUser ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2541D6] to-[#6B21D9] shadow-[0_6px_16px_rgba(107,33,217,0.25)] flex items-center justify-center">
            <FaUserCircle className="w-10 h-10 text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2541D6] to-[#6B21D9] shadow-[0_6px_16px_rgba(107,33,217,0.25)] flex items-center justify-center">
            <img src="/AlphaLegalGPT_Logo.png" alt="AlphaLegalGPT" className="w-6 h-6 object-contain" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'order-1 text-right' : 'order-2'}`}>
        {/* Error indicator */}
        {isError && (

          <div className="flex items-center gap-2 mb-2 text-[#5C6178] font-body">
            <FiAlertCircle className="w-4 h-4 text-[#6B21D9]" />
            <span className="text-sm">{t('errorOccurred')}</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`inline-block max-w-[80%] message-bubble relative group ${
            isUser
              ? 'bg-white border border-[#E7E9F3] rounded-2xl rounded-br-md'
              : isError
                ? 'bg-[#F6F7FB] border border-[#E7E9F3] rounded-2xl'
                : 'bg-white border border-[#E7E9F3] rounded-2xl rounded-bl-md'
          } px-4 py-3 shadow-sm
          transition-all duration-300
          group-hover:shadow-[0_12px_32px_rgba(16,24,40,0.08)] group-hover:-translate-y-0.5
          group-hover:border-[#0B0D1C]/10`}
        >
          {/* AI Badge */}
          {!isUser && !isError && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2 rounded-full border border-[#E7E9F3] bg-white shadow-sm px-2 py-0.5">
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-[#10B981] animate-[pulse-dot_5s_ease-in-out_infinite]" aria-hidden="true" />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wide text-[#6B21D9]">
                  {t('basedOnIPC')}
                </span>
              </div>
            </div>
          )}

          {/* Markdown Content */}
          <div className="markdown-content text-[15px] text-[#0B0D1C] font-body">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => {
                  const isMaps = props.href?.includes('google.com/maps');
                  if (isMaps) {
                    return (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E7E9F3] hover:bg-[#F6F7FB] text-[#2541D6] rounded-xl font-body font-semibold transition-all my-1 no-underline shadow-sm"
                      >
                        <FiMapPinIcon className="w-4 h-4" />
                        <span>{t('getDirections')}</span>
                      </a>
                    );
                  }
                  return <a {...props} className="text-[#2541D6] underline decoration-[#2541D6]/40 hover:text-[#6B21D9]" target="_blank" rel="noopener noreferrer" />;
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Citations & Confidence (for AI messages) */}
        {!isUser && !isError && message.citations && message.citations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3"
          >
            {/* Citations */}
            <div className="mb-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-[#5C6178] hover:text-[#0B0D1C] transition-colors font-body"
              >
                {isExpanded ? (
                  <FiChevronUp className="w-4 h-4" />
                ) : (
                  <FiChevronDown className="w-4 h-4" />
                )}
                <span className="font-medium">{t('citations')}</span>
                <span className="text-[10px] bg-white border border-[#E7E9F3] px-2 py-0.5 rounded font-mono text-[#6B21D9] shadow-sm">
                  {message.citations.length}
                </span>
              </button>
            </div>

            {/* Expandable citations */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, maxHeight: 0 }}
                  animate={{ opacity: 1, maxHeight: 200 }}
                  exit={{ opacity: 0, maxHeight: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#F6F7FB] rounded-xl p-3 space-y-2 border border-[#E7E9F3] shadow-sm">
                    {message.citations.map((citation, index) => (
                      <div
                        key={index}
                        className="text-sm text-[#5C6178] border-l-2 border-[#2541D6]/40 pl-3 font-body"
                      >
                        {citation}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confidence Score */}
            {message.confidence !== undefined && (
              <div className="flex items-center gap-2 mt-2 text-sm font-body">
                <FiCheckCircle className="w-4 h-4 text-[#2541D6]" />
                <span className="text-[#5C6178]">
                  {t('confidence')}: <span className="text-[#2541D6] font-medium">{Math.round(message.confidence * 100)}%</span>
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Timestamp */}
        <div className={`mt-1 text-xs text-[#9AA0B4] ${isUser ? 'text-right' : ''} font-body`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;