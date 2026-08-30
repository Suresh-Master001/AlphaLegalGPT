import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ChatMessage from '../components/chat/ChatMessage';

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3.5 mb-6 md:mb-8"
  >
    <div className="flex-shrink-0">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-10 h-10 rounded-xl bg-white border border-[#E7E9F3] shadow-sm flex items-center justify-center"
      >
        <img src="/AlphaLegalGPT_Logo.png" alt="AlphaLegalGPT" className="w-5 h-5 object-contain" />
      </motion.div>
    </div>
    <div className="flex items-end">
      <div className="px-4 py-3 bg-[#F6F7FB]/70 backdrop-blur rounded-2xl rounded-bl-md border border-[#E7E9F3] shadow-sm">
        <div className="flex items-center gap-1">
          <span className="typing-dot w-2 h-2 bg-[#9AA0B4]/60 rounded-full block" />
          <span className="typing-dot w-2 h-2 bg-[#9AA0B4]/60 rounded-full block" />
          <span className="typing-dot w-2 h-2 bg-[#9AA0B4]/60 rounded-full block" />
        </div>
      </div>
    </div>
  </motion.div>
);

const WelcomeScreen = ({ onExampleClick }) => {
  const { t } = useTranslation();
  const [randomExamples, setRandomExamples] = useState([]);

  useEffect(() => {
    const allExamples = t('examples', { returnObjects: true });
    if (Array.isArray(allExamples)) {
      const shuffled = [...allExamples].sort(() => 0.5 - Math.random());
      setRandomExamples(shuffled.slice(0, 4));
    } else {
      setRandomExamples([]);
    }
  }, [t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >

      {/* Title */}
      <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-[#2541D6] via-[#6B21D9] to-[#8B5CF6] bg-clip-text text-transparent mb-3">
        {t('welcomeTitle')}
      </h2>

      {/* Description */}
      <p className="text-[#5C6178] text-lg max-w-lg mb-8 font-body">
        {t('welcomeMessage')}
      </p>

      {/* Example Questions */}
      <div className="max-w-lg w-full">
        <p className="text-sm font-body font-medium text-[#9AA0B4] mb-4">
          {t('exampleQuestionsText')}
        </p>
        <div className="grid gap-3">
          {randomExamples.map((example, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onExampleClick(example)}
              className="text-left p-4 glass-panel hover:bg-white/90 text-[#0B0D1C] group rounded-2xl shadow-sm hover:shadow-lg hover:shadow-brand/10 card-hover-subtle border-white/60"
            >
              <span className="text-[#0B0D1C] group-hover:text-[#2541D6] transition-colors font-body">
                {example}
              </span>
            </motion.button>
          ))}
        </div>

      </div>
    </motion.div>
  );
};

const ChatWindow = ({ messages, isTyping, isLoading, streamingText, onExampleClick }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto smooth-scroll pb-6 md:pb-8 mobile-safe-top">
      <div className="max-w-[1300px] mx-auto px-3 sm:px-4 pt-6 md:pt-8">
        {/* Show welcome screen if no messages */}
        {messages.length === 0 && !streamingText ? (
          <WelcomeScreen onExampleClick={onExampleClick} />
        ) : (
          <div className="stagger-children">
            {/* Messages */}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={false}
              />
            ))}

            {/* Streaming text */}
            {streamingText && (
              <ChatMessage
                message={{ 
                  id: 'streaming', 
                  role: 'assistant', 
                  content: streamingText,
                  citations: [],
                  confidence: 0
                }}
                isStreaming={true}
              />
            )}

            {/* Typing indicator */}
            {isTyping && !streamingText && (
              <TypingIndicator />
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;