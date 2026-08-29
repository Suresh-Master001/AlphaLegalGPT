import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/layout/Sidebar';
import { FiBook, FiMenu, FiPlus } from 'react-icons/fi';
import ChatWindow from './ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import SettingsModal from '../components/modals/SettingsModal';
import NearbyOfficesSidebar from '../components/chat/NearbyOfficesSidebar';
import LawReferenceSidebar from '../components/chat/LawReferenceSidebar';
import useChat from '../hooks/useChat';
import { checkHealth } from '../services/api';

function MainApp() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
    const [isNearbyOpen, setIsNearbyOpen] = useState(false);
  const [isLawSidebarOpen, setIsLawSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  const [detectedLaws, setDetectedLaws] = useState([]);

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
    clearChat,
    clearAllHistory,
    location,
    isLocationEnabled,
    isLocationLoading,
    toggleLocation,
    hasGeneratedResponse,
    isConnected,
  } = useChat();

  // Detect laws in the current response
  useEffect(() => {
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || streamingText;
    
    if (lastAssistantMessage) {
      const regex = /(?:IPC|CrPC|BNSS|Section|Sec|u\/s|S\.)\s*(\d+[A-Z]?)(?:\s*(?:of|in)\s*(?:the\s+)?(?:IPC|CrPC|BNSS))?/gi;
      const matches = [...lastAssistantMessage.matchAll(regex)];
      
      if (matches.length > 0) {
        const sections = [...new Set(matches.map(m => {
          const num = m[1];
          const type = m[0].toUpperCase().includes('CRPC') ? 'CrPC' : 
                      m[0].toUpperCase().includes('BNSS') ? 'BNSS' : 'IPC';
          return `${type} ${num}`;
        }))];

        setDetectedLaws(prev => {
          if (JSON.stringify(prev) === JSON.stringify(sections)) return prev;
          return sections;
        });
        setIsLawSidebarOpen(true);
      }
    }
  }, [messages.length, streamingText]);

  // Reset sidebars when a new user message is sent
  useEffect(() => {
    const lastMessage = messages.slice(-1)[0];
    if (lastMessage?.role === 'user') {
      setIsLawSidebarOpen(false);
      setDetectedLaws([]);
    }
  }, [messages.length]);

  // Note: isConnected is now coming from useChat hook which tracks socket connection status
  // The health check endpoint still works but we rely on socket connection status for UI
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await checkHealth();
        // Socket connection status is already handled by useChat hook
      } catch (err) {
        // Socket connection status will show as disconnected
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

  // Clear input when switching chats
  useEffect(() => {
    setInputValue('');
  }, [currentChatId]);

  // Auto-open sidebar when location is enabled, close when disabled
  useEffect(() => {
    if (isLocationEnabled) {
      setIsNearbyOpen(true);
    } else {
      setIsNearbyOpen(false);
    }
  }, [isLocationEnabled]);

  // Handle sending message
  const handleSendMessage = async (content) => {
    setInputValue('');
    setIsNearbyOpen(false);
    await sendMessage(content);
  };

  return (
    <div className="flex h-screen bg-mesh-subtle relative">

            {/* Left Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={switchChat}
        onDeleteChat={deleteChat}
        language={language}
        onLanguageChange={handleLanguageChange}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onClearAllHistory={clearAllHistory}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Mobile backdrop overlay - shows while sidebar is open on small screens */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 ${isSidebarOpen ? 'md:ml-[260px]' : ''} ${isNearbyOpen ? 'md:mr-[300px]' : ''} flex flex-col h-full transition-all duration-300`}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 px-4 sm:px-5 md:px-6 pb-3 md:pb-4 border-b border-[#E7E9F3] bg-white/80 backdrop-blur-xl sticky top-0 z-40 safe-top"
        >
          <div className="flex items-center gap-2.5 md:gap-3 min-w-0 flex-1">
            {/* Sidebar toggle (mobile) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-white border border-[#E7E9F3] shadow-sm text-[#5C6178] hover:bg-[#F6F7FB] hover:text-[#0B0D1C] transition-colors shrink-0"
              aria-label="Open sidebar"
            >
              <FiMenu className="w-5 h-5" />
            </motion.button>

            {/* Brand avatar */}
            <div className="w-12 h-12 md:w-10 md:h-10">
              <img src="/AlphaLegalGPT_Logo.png" alt="AlphaLegalGPT Logo" />
            </div>

            {/* Title + mobile status */}
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] sm:text-lg font-display font-semibold gradient-text truncate leading-tight">
                {chats.find(c => c.id === currentChatId)?.title || t('appName')}
              </h2>
              {/* Connection status line (mobile) */}
              {!isCheckingHealth && (
                <span
                  className={`flex sm:hidden items-center gap-1.5 text-[11px] font-body font-medium leading-tight ${
                    isConnected ? 'text-[#10B981]' : 'text-red-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-[#10B981] animate-pulse' : 'bg-red-500'
                    }`}
                  />
                  {isConnected ? t('connected') : t('disconnected')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Connection status pill (desktop) */}
            {isConnected && (
              <span className="hidden sm:flex items-center gap-1.5 shrink-0 text-xs text-[#10B981] bg-white border border-[#E7E9F3] px-2.5 py-1 rounded-full font-mono font-medium shadow-sm">
                <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                {t('connected')}
              </span>
            )}
            {!isCheckingHealth && !isConnected && (
              <span className="hidden sm:flex items-center gap-1.5 shrink-0 text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                {t('disconnected')}
              </span>
            )}

            {/* New chat quick action (mobile) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={createNewChat}
              className="md:hidden p-2.5 rounded-xl bg-gradient-to-br from-[#2541D6] to-[#6B21D9] text-white shadow-[0_6px_16px_rgba(107,33,217,0.25)] active:opacity-90 transition-opacity shrink-0"
              aria-label={t('newChat')}
              title={t('newChat')}
            >
              <FiPlus className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.header>

        {/* Chat Window */}
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          isLoading={isLoading}
          streamingText={streamingText}
          onExampleClick={setInputValue}
        />

        {/* Chat Input */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!isConnected || isLoading}
          isLocationEnabled={isLocationEnabled}
          isLocationLoading={isLocationLoading}
          onLocationToggle={toggleLocation}
          hasGeneratedResponse={hasGeneratedResponse}
        />
      </main>

      {/* Law Reference Sidebar - Slides from left */}
      <LawReferenceSidebar
        detectedLaws={detectedLaws}
        isOpen={isLawSidebarOpen}
        onClose={() => setIsLawSidebarOpen(false)}
      />

      {/* Right Nearby Offices Sidebar */}
      <NearbyOfficesSidebar
        query={messages.filter(m => m.role === 'user').slice(-1)[0]?.content || ''}
        response={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || streamingText}
        location={location}
        isOpen={isNearbyOpen}
        onClose={() => setIsNearbyOpen(false)}
        isLocationEnabled={isLocationEnabled}
        hasGeneratedResponse={hasGeneratedResponse}
      />

      {/* Error Toast */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 right-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-600 text-sm max-w-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Floating Toggle for Laws Sidebar (when closed) */}
      {!isLawSidebarOpen && (
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsLawSidebarOpen(true)}
          className="fixed left-0 top-[30%] -translate-y-1/2 z-[90] bg-gradient-to-r from-[#2541D6] to-[#6B21D9] hover:from-[#1e3bb8] hover:to-[#5B1ED6] text-white p-3 rounded-r-xl shadow-lg transition-all group"
          title={t('openLaws')}
        >
          <FiBook className="w-5 h-5" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-white border border-[#E7E9F3] rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-body">
            {t('openLaws')}
          </span>
        </motion.button>
      )}
    </div>
  );
}

export default MainApp;