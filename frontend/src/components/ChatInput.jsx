import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiSend, 
  FiMic, 
  FiFile, 
  FiX 
} from 'react-icons/fi';

const ChatInput = ({ onSendMessage, isLoading, disabled }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-4"
    >
      <div className="max-w-[900px] mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-input-bg rounded-2xl border border-border focus-within:border-accent/50 transition-colors"
        >
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('typeMessage')}
              disabled={disabled}
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-[15px] text-text-primary placeholder:text-text-secondary resize-none disabled:opacity-50"
              style={{ minHeight: '24px', maxHeight: '200px' }}
            />
            
            {/* Clear button */}
            {message && (
              <button
                type="button"
                onClick={() => setMessage('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-hover-bg rounded-full transition-colors"
              >
                <FiX className="w-4 h-4 text-text-secondary" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pr-2 pb-2">
            {/* Voice Input (disabled) */}
            <button
              type="button"
              disabled
              className="p-2.5 text-text-secondary hover:text-text-primary rounded-xl hover:bg-hover-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={t('voiceInput')}
            >
              <FiMic className="w-5 h-5" />
            </button>

            {/* PDF Upload (disabled) */}
            <button
              type="button"
              disabled
              className="p-2.5 text-text-secondary hover:text-text-primary rounded-xl hover:bg-hover-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={t('pdfUpload')}
            >
              <FiFile className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <motion.button
              type="submit"
              disabled={disabled || !message.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2.5 rounded-xl transition-colors ${
                message.trim() && !disabled
                  ? 'bg-accent text-white hover:bg-accent-hover'
                  : 'bg-hover-bg text-text-secondary'
              } disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSend className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </form>

        {/* Disclaimer */}
        <p className="text-center text-xs text-text-secondary mt-2">
          {t('legalDisclaimer')}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatInput;

