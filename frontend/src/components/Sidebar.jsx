import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiPlus, 
  FiMessageSquare, 
  FiSettings, 
  FiTrash2,
  FiGlobe,
  FiUser
} from 'react-icons/fi';
import { FaGavel } from 'react-icons/fa';

const Sidebar = ({ 
  chats, 
  currentChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  language,
  onLanguageChange,
  onSettingsClick 
}) => {
  const { t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  ];

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-[260px] bg-sidebar border-r border-border flex flex-col z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <FaGavel className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">{t('appName')}</h1>
            <p className="text-xs text-text-secondary">{t('appSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          {t('newChat')}
        </motion.button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-xs font-medium text-text-secondary uppercase tracking-wider px-2 py-2">
          {t('chatHistory')}
        </div>
        
        {chats.length === 0 ? (
          <div className="text-sm text-text-secondary px-2 py-4 text-center">
            {t('noChats')}
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id 
                    ? 'bg-hover-bg active' 
                    : 'hover:bg-hover-bg'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FiMessageSquare className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <span className="text-sm text-text-primary truncate">
                    {chat.title}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                >
                  <FiTrash2 className="w-4 h-4 text-red-400" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        {/* Language Toggle */}
        <div className="flex items-center justify-between px-3 py-2 mb-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <FiGlobe className="w-4 h-4" />
            <span className="text-sm">{language === 'en' ? 'EN' : 'TA'}</span>
          </div>
          <div className="flex gap-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  language === lang.code
                    ? 'bg-accent text-white'
                    : 'bg-hover-bg text-text-secondary hover:text-text-primary'
                }`}
              >
                {lang.flag}
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <button 
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hover-bg rounded-lg transition-colors text-text-secondary hover:text-text-primary"
        >
          <FiSettings className="w-5 h-5" />
          <span className="text-sm">{t('settings')}</span>
        </button>

        {/* User */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hover-bg rounded-lg transition-colors text-text-secondary hover:text-text-primary">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <FiUser className="w-4 h-4 text-accent" />
          </div>
          <span className="text-sm">User</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

