import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiCheckCircle,
  FiAlertCircle 
} from 'react-icons/fi';
import { FaRobot, FaUserCircle } from 'react-icons/fa';

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
          <FaUserCircle className="w-10 h-10 text-text-secondary" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <FaRobot className="w-5 h-5 text-accent" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'order-1 text-right' : 'order-2'}`}>
        {/* Error indicator */}
        {isError && (
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <FiAlertCircle className="w-4 h-4" />
            <span className="text-sm">{t('errorOccurred')}</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`inline-block max-w-[80%] message-bubble ${
            isUser
              ? 'bg-user-message rounded-2xl rounded-br-md'
              : isError
              ? 'bg-red-500/10 border border-red-500/30 rounded-2xl'
              : 'bg-ai-message rounded-2xl rounded-bl-md'
          } px-4 py-3`}
        >
          {/* AI Badge */}
          {!isUser && !isError && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                {t('basedOnIPC')}
              </span>
            </div>
          )}

          {/* Markdown Content */}
          <div className="markdown-content text-[15px] text-text-primary">
            {isStreaming ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
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
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {isExpanded ? (
                  <FiChevronUp className="w-4 h-4" />
                ) : (
                  <FiChevronDown className="w-4 h-4" />
                )}
                <span className="font-medium">{t('citations')}</span>
                <span className="text-xs bg-hover-bg px-2 py-0.5 rounded">
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
                  <div className="bg-ai-message rounded-lg p-3 space-y-2">
                    {message.citations.map((citation, index) => (
                      <div
                        key={index}
                        className="text-sm text-text-secondary border-l-2 border-accent/50 pl-3"
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
              <div className="flex items-center gap-2 mt-2 text-sm">
                <FiCheckCircle className="w-4 h-4 text-accent" />
                <span className="text-text-secondary">
                  {t('confidence')}: <span className="text-accent font-medium">{Math.round(message.confidence * 100)}%</span>
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Timestamp */}
        <div className={`mt-1 text-xs text-text-secondary ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;

