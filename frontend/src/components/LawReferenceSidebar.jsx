import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX, FiBook, FiInfo, FiChevronRight, FiChevronDown, FiAlertCircle } from 'react-icons/fi';

const LawReferenceSidebar = ({ detectedLaws, isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [lawsData, setLawsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [manualQuery, setManualQuery] = useState('');

  const fetchLaws = async (queryStr) => {
    if (!queryStr) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const lang = i18n.language && i18n.language.startsWith('ta') ? 'ta' : 'en';
      console.log(`📡 Fetching laws for: "${queryStr}" [lang=${lang}]`);
      
      const response = await fetch(`/api/laws/search?q=${encodeURIComponent(queryStr)}&lang=${lang}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log(`✅ Received ${data.length} results.`);
      setLawsData(data);
    } catch (error) {
      console.error('❌ Law fetch failed:', error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && detectedLaws && detectedLaws.length > 0) {
      setManualQuery('');
      fetchLaws(detectedLaws.join(','));
    }
  }, [detectedLaws, isOpen, i18n.language]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualQuery.trim()) {
      fetchLaws(manualQuery);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-full max-w-[380px] bg-slate-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <FiBook className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{t('legalReferences')}</h2>
                    <p className="text-xs text-white/50">Statutory Reference Engine</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Manual Search Input */}
              <form onSubmit={handleManualSearch} className="relative group">
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="Search Section (e.g. 420)..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
                {manualQuery && (
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-md hover:bg-emerald-600 transition-colors"
                  >
                    FIND
                  </button>
                )}
              </form>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-sm text-white/70">Analyzing legal statutes...</p>
                </div>
              ) : error ? (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <FiAlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-red-400 mb-1">Search Failed</h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {error}. Please try again or check your connection.
                  </p>
                </div>
              ) : lawsData.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiInfo className="w-8 h-8 text-white/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No sections detected</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Legal sections will appear here when mentioned in the expert's advice.
                  </p>
                </div>
              ) : (
                lawsData.map((law, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 rounded-xl overflow-hidden"
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === index ? null : index)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2 uppercase tracking-wide">
                            {law.section}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                            {law.title}
                          </h4>
                        </div>
                        <div className="p-1 rounded-lg bg-slate-900 group-hover:bg-emerald-500/10 transition-colors">
                          {expandedId === index ? (
                            <FiChevronDown className="w-4 h-4 text-white/70" />
                          ) : (
                            <FiChevronRight className="w-4 h-4 text-white/70" />
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 overflow-hidden"
                        >
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-sm text-white/70 leading-relaxed mb-4">
                              {law.content}
                            </p>
                            
                            {law.punishment && law.punishment !== "Not specified" && (
                              <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex gap-3">
                                <FiAlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-1">Punishment</span>
                                  <p className="text-xs text-white leading-normal italic">
                                    {law.punishment}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Tip */}
            {lawsData.length > 0 && (
              <div className="p-4 bg-emerald-500/5 border-t border-white/10">
                <p className="text-[10px] text-emerald-400/80 text-center uppercase font-bold tracking-[0.1em]">
                  AlphaLegal Statutory Reference Engine
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LawReferenceSidebar;
