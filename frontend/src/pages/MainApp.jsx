import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from '../components/ChatInput';
import SettingsModal from '../components/SettingsModal';
import useChat from '../hooks/useChat';
import { checkHealth } from '../services/api';

function MainApp() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    messages,
    isLoading,
    isTyping,
    streamingText,
    chats,
    currentChatId,
    error,
    createNewChat,
    switchChat,
    deleteChat,
    sendMessage,
  } = useChat();

  // Check backend health on mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const health = await checkHealth();
        setIsConnected(health.status === 'ok');
      } catch (err) {
        setIsConnected(false);
      } finally {
        setIsCheckingHealth(false);
      }
    };

    checkBackendHealth();

    // Recheck every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle language change
  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  // Create initial chat if none exists
  useEffect(() => {
    if (chats.length === 0) {
      createNewChat();
    }
  }, []);

  // Handle sending message
  const handleSendMessage = async (content) => {
    await sendMessage(content);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={switchChat}
        onDeleteChat={deleteChat}
        language={language}
        onLanguageChange={handleLanguageChange}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 ml-[260px] flex flex-col h-full">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-40"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-text-primary">
              {chats.find(c => c.id === currentChatId)?.title || t('appName')}
            </h2>
            {isConnected && (
              <span className="flex items-center gap-1.5 text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                {t('connected')}
              </span>
            )}
          </div>

          {/* Connection status */}
          {!isCheckingHealth && !isConnected && (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <span className="w-2 h-2 bg-red-400 rounded-full" />
              {t('disconnected')}
            </div>
          )}
        </motion.header>

        {/* Chat Window */}
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          isLoading={isLoading}
          streamingText={streamingText}
        />

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!isConnected || isLoading}
        />
      </main>

      {/* Error Toast */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 right-6 bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm max-w-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}

export default MainApp;
