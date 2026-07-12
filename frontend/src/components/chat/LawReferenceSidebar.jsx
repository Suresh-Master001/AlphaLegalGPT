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
            className="fixed left-0 top-0 h-full w-full max-w-[380px] bg-white border-r border-[#E7E9F3] shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E7E9F3] bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2541D6] to-[#6B21D9] shadow-[0_6px_16px_rgba(107,33,217,0.25)] flex items-center justify-center flex-shrink-0">
                    <FiBook className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-bold text-[#0B0D1C]">Legal References</h2>
                    <p className="text-xs text-[#5C6178] font-body">Statutory Reference Engine</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#F6F7FB] rounded-lg transition-colors text-[#9AA0B4] hover:text-[#0B0D1C]"
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
                  className="w-full bg-white border border-[#E7E9F3] rounded-xl px-4 py-2.5 pl-10 text-sm text-[#0B0D1C] placeholder:text-[#9AA0B4] focus:outline-none focus:border-[#2541D6]/50 transition-all font-body"
                />
                <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA0B4] group-focus-within:text-[#2541D6] transition-colors" />
                {manualQuery && (
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gradient-to-r from-[#2541D6] to-[#6B21D9] text-white text-[10px] font-mono font-semibold rounded-md hover:from-[#1e3bb8] hover:to-[#5B1ED6] transition-all"
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
                  <div className="w-10 h-10 border-4 border-[#2541D6]/20 border-t-[#2541D6] rounded-full animate-spin" />
                  <p className="text-sm text-[#5C6178] font-body">Analyzing legal statutes...</p>
                </div>
              ) : error ? (
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                  <FiAlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <h3 className="text-sm font-display font-bold text-red-600 mb-1">Search Failed</h3>
                  <p className="text-xs text-[#5C6178] leading-relaxed font-body">
                    {error}. Please try again or check your connection.
                  </p>
                </div>
              ) : lawsData.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <div className="w-16 h-16 bg-[#F6F7FB] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiInfo className="w-8 h-8 text-[#9AA0B4]" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-[#0B0D1C] mb-2">No sections detected</h3>
                  <p className="text-sm text-[#5C6178] leading-relaxed font-body">
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
                    className="group bg-white border border-[#E7E9F3] hover:border-[#2541D6]/30 transition-all duration-300 rounded-xl overflow-hidden"
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === index ? null : index)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-white border border-[#E7E9F3] text-[#6B21D9] text-xs font-mono font-semibold mb-2 uppercase tracking-wide shadow-sm">
                            {law.section}
                          </span>
                          <h4 className="text-sm font-display font-semibold text-[#0B0D1C] leading-snug group-hover:text-[#2541D6] transition-colors">
                            {law.title}
                          </h4>
                        </div>
                        <div className="p-1 rounded-lg bg-[#F6F7FB] group-hover:bg-[#F6F7FB] transition-colors">
                          {expandedId === index ? (
                            <FiChevronDown className="w-4 h-4 text-[#5C6178]" />
                          ) : (
                            <FiChevronRight className="w-4 h-4 text-[#9AA0B4]" />
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
                          <div className="pt-2 border-t border-[#E7E9F3]">
                            <p className="text-sm text-[#5C6178] leading-relaxed mb-4 font-body">
                              {law.content}
                            </p>
                            
                            {law.punishment && law.punishment !== "Not specified" && (
                              <div className="p-3 bg-red-500/5 border border-red-500/30 rounded-lg flex gap-3">
                                <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-mono font-semibold text-red-500 uppercase tracking-wider block mb-1">Punishment</span>
                                  <p className="text-xs text-[#0B0D1C] leading-normal font-body">
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
              <div className="p-4 bg-gradient-to-r from-[#2541D6]/5 to-[#6B21D9]/5 border-t border-[#E7E9F3]">
                <p className="text-[10px] text-[#2541D6]/80 text-center uppercase font-mono font-semibold tracking-[0.1em]">
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