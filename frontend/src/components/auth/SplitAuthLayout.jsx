import React from 'react';
import { motion } from 'framer-motion';

/**
 * SplitAuthLayout - Premium split-panel authentication layout
 * Supports inverse mode (form left, design right) for signup
 */
const SplitAuthLayout = ({ children, inverse = false }) => {
  return (
    <div
      className="flex items-center justify-center bg-mesh px-4 py-6 md:p-8 relative overflow-hidden min-h-screen md:min-h-dvh"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Floating orbs background (subtle on mobile) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="bg-orb bg-orb-1" style={{ top: '-8rem', left: '-8rem' }} />
        <div className="bg-orb bg-orb-2" style={{ bottom: '-8rem', right: '-8rem' }} />
        <div className="bg-orb bg-orb-3" style={{ top: '40%', left: '60%', width: '35rem', height: '35rem' }} />
        <div className="hidden md:block absolute top-1/4 right-1/4 w-64 h-64 rounded-full border border-[#2541D6]/10 animate-spin-slow" />
        <div className="hidden md:block absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full border border-[#6B21D9]/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
      </div>

      {/* Main split card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[960px] relative z-10 my-auto"
      >
        <div className={`flex flex-col ${inverse ? 'md:flex-row-reverse' : 'md:flex-row'} rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(37,65,214,0.18),0_4px_16px_rgba(0,0,0,0.04)] border border-white/60 backdrop-blur-sm`}>
          {children}
        </div>

        {/* Mobile-only trust footer */}
        <p className="md:hidden text-center text-[11px] text-[#9AA0B4] mt-4">
          Powered by{' '}
          <a href="https://codenxte.com" target="_blank" rel="noopener noreferrer" className="text-[#2541D6] font-medium">
            CodeNxte Web &amp; Software Solutions
          </a>
        </p>
      </motion.div>
    </div>
  );
};

/**
 * WelcomePanel - Blue panel with branding and CTA
 */
export const WelcomePanel = ({ title, description, ctaText, ctaLink }) => {
  return (
    <div className="relative w-full md:w-[45%] md:min-h-[520px] bg-gradient-primary px-5 py-4 md:p-12 flex flex-row items-center justify-between gap-4 md:flex-col md:items-stretch md:justify-between overflow-hidden order-2 md:order-none">
      {/* Decorative floating elements (desktop only) */}
      <div className="hidden md:block absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-white/15 animate-spin-slow" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full border border-white/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
      </div>

      {/* Brand strip — compact row on mobile, top block on desktop */}
      <div className="relative z-10 flex items-center gap-2.5">
        <img
          src="/AlphaLegalGPT_Logo.png"
          alt="AlphaLegalGPT Logo"
          className="w-9 h-9 md:w-11 md:h-11 object-contain rounded-xl bg-white/15 p-1"
        />
        <span className="text-white font-semibold text-base md:text-lg tracking-tight">AlphaLegalGPT</span>
      </div>

      {/* Mobile tagline */}
      <p className="md:hidden relative z-10 text-white/85 text-[11px] leading-snug text-right max-w-[120px]">
        India's AI-Powered Legal Assistant
      </p>

      {/* Center: Icon + Text (desktop only) */}
      <div className="hidden md:flex relative z-10 flex-1 flex-col items-center justify-center py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-24 h-24 bg-white/20 rounded-full overflow-hidden"
        >
          <img
            src="/AlphaLegalGPT_Logo.png"
            alt="AlphaLegalGPT Logo"
            className="w-full h-full object-contain p-2"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-white text-xl md:text-2xl font-semibold text-center mb-3"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-white/70 text-sm md:text-base text-center max-w-[280px] leading-relaxed"
        >
          {description}
        </motion.p>
      </div>

      {/* Bottom: CTA (desktop only — mobile uses the link under the form) */}
      <div className="hidden md:block relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a
            href={ctaLink}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium group transition-colors"
          >
            {ctaText}
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * FormPanel - White panel with form content (form-first on mobile)
 */
export const FormPanel = ({ children }) => {
  return (
    <div
      className="w-full md:w-[55%] md:min-h-[520px] bg-white/95 backdrop-blur-sm px-5 py-7 sm:px-8 sm:py-10 md:p-12 lg:p-14 flex flex-col justify-center order-1 md:order-none"
      style={{ paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  );
};

export default SplitAuthLayout;
