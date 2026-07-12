import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiPlus, 
  FiMessageSquare, 
  FiSettings, 
  FiTrash2,
  FiGlobe, 
  FiUser, 
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ 
  chats, 
  currentChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  language,
  onLanguageChange,
  onSettingsClick,
  onClearAllHistory
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', name: 'English', label: 'EN' },
    { code: 'ta', name: 'தமிழ்', label: 'TA' },
  ];

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-[#E7E9F3] flex flex-col z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E7E9F3]">
        <div className="flex items-center gap-3">
          <img src="/AlphaLegalGPT_Logo.png" alt="AlphaLegalGPT Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-display font-bold bg-gradient-to-r from-[#2541D6] to-[#6B21D9] bg-clip-text text-transparent">{t('appName')}</h1>
            <p className="text-xs text-[#5C6178] font-body">{t('appSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-white border border-[#E7E9F3] text-[#0B0D1C] rounded-xl hover:border-[#0B0D1C]/20 shadow-sm transition-all text-sm font-body font-medium"
        >
          <FiPlus className="w-5 h-5" />
          {t('newChat')}
        </motion.button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-xs font-mono font-medium text-[#9AA0B4] uppercase tracking-wide px-2 py-2">
          {t('chatHistory')}
        </div>
        
        {chats.length === 0 ? (
          <div className="text-sm text-[#5C6178] px-2 py-4 text-center font-body">
            {t('noChats')}
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  currentChatId === chat.id 
                    ? 'bg-white border border-[#E7E9F3] shadow-sm' 
                    : 'hover:bg-[#F6F7FB]'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FiMessageSquare className="w-4 h-4 text-[#9AA0B4] flex-shrink-0" />
                  <span className="text-sm text-[#0B0D1C] truncate font-body">
                    {chat.title}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <FiTrash2 className="w-4 h-4 text-red-500" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#E7E9F3] relative" ref={menuRef}>
        {/* Language Toggle */}
        <div className="mb-4 px-1">
          <div className="bg-white p-1 rounded-xl flex items-center relative h-11 border border-[#E7E9F3] shadow-sm">
            <motion.div
              initial={false}
              animate={{
                x: language === 'en' ? 0 : '100%'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#2541D6] to-[#6B21D9] rounded-lg shadow-lg z-0"
            />
            
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-1.5 transition-colors duration-200 ${
                  language === lang.code ? 'text-white font-medium' : 'text-[#5C6178] hover:text-[#0B0D1C]'
                }`}
              >
                <span className="text-sm font-mono font-bold">{lang.label}</span>
                <span className="text-xs font-body opacity-80">
                  {lang.code === 'en' ? 'English' : 'தமிழ்'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* User Dropdown Menu */}
        <AnimatePresence>
          {isUserMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-16 left-3 right-3 bg-white border border-[#E7E9F3] shadow-2xl rounded-xl overflow-hidden z-50 flex flex-col"
            >
              {/* User Details */}
              <div className="px-4 py-3 border-b border-[#E7E9F3] bg-[#F6F7FB]">
                <p className="text-sm font-body font-semibold text-[#0B0D1C] capitalize truncate">
                  {user?.name || "Alpha User"}
                </p>
                <p className="text-xs text-[#5C6178] truncate mt-0.5 font-body">
                  {user?.email || "user@alphalegal.com"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-1.5 flex flex-col">
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onSettingsClick();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F6F7FB] rounded-xl transition-colors text-[#5C6178] hover:text-[#0B0D1C] text-sm font-body"
                >
                  <FiSettings className="w-4 h-4 flex-shrink-0" />
                  <span>{t('settings')}</span>
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm(t('confirmClearAll'))) {
                      onClearAllHistory();
                      setIsUserMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-xl transition-colors text-red-500 hover:text-red-600 text-sm font-body"
                >
                  <FiTrash2 className="w-4 h-4 flex-shrink-0" />
                  <span>{t('clearAllHistory')}</span>
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-xl transition-colors text-red-500 hover:text-red-600 text-sm font-body"
                >
                  <FiLogOut className="w-4 h-4 flex-shrink-0" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Trigger Button */}
        <button 
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors font-body ${
            isUserMenuOpen ? 'bg-[#F6F7FB] text-[#0B0D1C]' : 'text-[#5C6178] hover:bg-[#F6F7FB] hover:text-[#0B0D1C]'
          }`}
        >
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2541D6] to-[#6B21D9] shadow-[0_4px_12px_rgba(107,33,217,0.2)] flex items-center justify-center flex-shrink-0">
              <FiUser className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-body font-medium truncate capitalize">{user?.name || "User"}</span>
          </div>
          <svg className={`w-4 h-4 flex-shrink-0 text-[#9AA0B4] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;