import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiKey, FiSave, FiCheck, FiAlertCircle, FiCpu } from 'react-icons/fi';
import { SiHuggingface, SiOpenai } from 'react-icons/si';

const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    huggingfaceApiKey: '',
    openaiApiKey: '',
    togetherApiKey: '',
  });
  const [showKeys, setShowKeys] = useState({
    huggingface: false,
    openai: false,
    together: false,
  });
  const [saveStatus, setSaveStatus] = useState(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        huggingfaceApiKey: parsed.huggingfaceApiKey || '',
        openaiApiKey: parsed.openaiApiKey || '',
        togetherApiKey: parsed.togetherApiKey || '',
      });
    }
  }, []);

  // Handle input change
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle password visibility
  const toggleShowKey = (field) => {
    setShowKeys((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save settings to localStorage
  const handleSave = () => {
    try {
      localStorage.setItem('apiSettings', JSON.stringify(settings));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  // Clear all settings
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all API keys?')) {
      setSettings({
        huggingfaceApiKey: '',
        openaiApiKey: '',
        togetherApiKey: '',
      });
      localStorage.removeItem('apiSettings');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-sidebar border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <FiKey className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">API Configuration</h2>
                <p className="text-xs text-text-secondary">Configure your AI service API keys</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-hover-bg rounded-lg transition-colors text-text-secondary hover:text-text-primary"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Info Banner */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Optional Configuration</p>
                  <p className="text-blue-300/70">
                    These API keys are optional. The application currently uses built-in embeddings. 
                    Add API keys to enable advanced AI features like better embeddings and LLM responses.
                  </p>
                </div>
              </div>
            </div>

            {/* HuggingFace API */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SiHuggingface className="w-5 h-5 text-yellow-400" />
                <label className="text-sm font-medium text-text-primary">
                  HuggingFace API Key
                </label>
              </div>
              <div className="relative">
                <input
                  type={showKeys.huggingface ? 'text' : 'password'}
                  value={settings.huggingfaceApiKey}
                  onChange={(e) => handleChange('huggingfaceApiKey', e.target.value)}
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-input-bg border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('huggingface')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showKeys.huggingface ? (
                    <FiX className="w-5 h-5" />
                  ) : (
                    <FiKey className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-text-secondary">
                Get free API key from{' '}
                <a 
                  href="https://huggingface.co/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  huggingface.co
                </a>
              </p>
            </div>

            {/* OpenAI API */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SiOpenai className="w-5 h-5 text-green-400" />
                <label className="text-sm font-medium text-text-primary">
                  OpenAI API Key
                </label>
              </div>
              <div className="relative">
                <input
                  type={showKeys.openai ? 'text' : 'password'}
                  value={settings.openaiApiKey}
                  onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-input-bg border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('openai')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showKeys.openai ? (
                    <FiX className="w-5 h-5" />
                  ) : (
                    <FiKey className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-text-secondary">
                Get API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
            </div>

            {/* Together AI API */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FiCpu className="w-5 h-5 text-purple-400" />
                <label className="text-sm font-medium text-text-primary">
                  Together AI API Key
                </label>
              </div>
              <div className="relative">
                <input
                  type={showKeys.together ? 'text' : 'password'}
                  value={settings.togetherApiKey}
                  onChange={(e) => handleChange('togetherApiKey', e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-input-bg border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('together')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showKeys.together ? (
                    <FiX className="w-5 h-5" />
                  ) : (
                    <FiKey className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-text-secondary">
                Get API key from{' '}
                <a 
                  href="https://together.ai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  together.ai
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background/50">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Clear All
            </button>
            
            <div className="flex items-center gap-3">
              {saveStatus === 'success' && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 text-sm text-green-400"
                >
                  <FiCheck className="w-4 h-4" />
                  Saved!
                </motion.span>
              )}
              {saveStatus === 'error' && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 text-sm text-red-400"
                >
                  <FiAlertCircle className="w-4 h-4" />
                  Error saving
                </motion.span>
              )}
              
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary bg-hover-bg hover:bg-border rounded-lg transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
              >
                <FiSave className="w-4 h-4" />
                Save Changes
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;

