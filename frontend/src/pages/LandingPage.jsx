import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowUpRight,
  FiCheck,
  FiShield,
  FiZap,
  FiFileText,
  FiMessageCircle,
  FiMenu,
  FiX,
  FiInfo,
} from 'react-icons/fi';

/**
 * Landing Page Component - High-Tech Light Theme
 * @description Main landing page for AlphaLegalGPT showcasing features and benefits
 */
const LandingPage = ({ onGetStarted }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const features = [
    {
      icon: FiZap,
      title: 'Instant Legal Clarification',
      description:
        'Ask questions in plain language and get context-aware explanations grounded in the IPC, BNS and CrPC, in seconds rather than hours of research.',
    },
    {
      icon: FiFileText,
      title: 'Document Analysis',
      description:
        'Upload contracts, FIRs or case files. AlphaLegalGPT highlights key clauses, obligations and potential red flags automatically.',
    },
    {
      icon: FiShield,
      title: 'Secure & Private',
      description:
        'OTP-based authentication and encrypted session handling keep every conversation and document confidential by default.',
    },
    {
      icon: FiMessageCircle,
      title: 'Real-Time Chat',
      description:
        'Streamed, low-latency responses mean you see answers forming as the model reasons, not after a long wait.',
    },
  ];

  const benefits = [
    'Instant legal answers, available around the clock',
    'Document review that takes seconds, not hours',
    'Secure OTP verification on every session',
    'Real-time streaming responses as you type',
    'A mobile-responsive experience on any device',
    'A privacy-first architecture, by design',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Enable scrolling on body for landing page (override global overflow: hidden)
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleGetStarted = () => {
    setMobileNavOpen(false);
    if (typeof onGetStarted === 'function') {
      onGetStarted();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FCFCFF] overflow-x-hidden scroll-smooth" style={{ overflow: 'visible' }}>
      {/* Skip link for keyboard and screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-[#0B0D1C] focus:px-5 focus:py-2 focus:text-sm focus:font-body focus:text-white"
      >
        Skip to main content
      </a>

      {/* Background treatment - Aurora mesh blobs (decorative only) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Subtle fine grain */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.8%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27120%27 height=%27120%27 filter=%27url(%23n)%27 opacity=%270.45%27/%3E%3C/svg%3E")',
          }}
        />

        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-60 -left-60 w-[52rem] h-[52rem] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(62,99,255,0.55) 0%, rgba(62,99,255,0) 60%)',
            filter: 'blur(130px)',
          }}
        />

        <motion.div
          animate={{ x: [0, -16, 0], y: [0, 14, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-56 -right-64 w-[58rem] h-[58rem] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(139,63,232,0.45) 0%, rgba(139,63,232,0) 60%)',
            filter: 'blur(140px)',
          }}
        />

        <motion.div
          animate={{ x: [0, 14, 0], y: [0, 10, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-28 right-[-20rem] w-[44rem] h-[44rem] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(226,63,160,0.3) 0%, rgba(226,63,160,0) 60%)',
            filter: 'blur(150px)',
          }}
        />
      </div>

      {/* Header/Navigation - Fixed/Sticky */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 lg:px-12 bg-white/80 backdrop-blur-xl border-b border-[#E7E9F3]"
      >
        <Link to="/" className="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[#3E63FF]/20 via-[#8B3FE8]/20 to-[#E23FA0]/20 blur-2xl" aria-hidden="true" />
            <img
              src="/AlphaLegalGPT_Logo.png"
              alt="AlphaLegalGPT logo"
              className="relative w-10 h-10 object-contain"
            />
          </div>
          <span className="text-xl font-display font-bold bg-gradient-to-r from-[#2541D6] via-[#6B21D9] to-[#8B5CF6] bg-clip-text text-transparent">
            AlphaLegalGPT
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-body text-[#5C6178] hover:text-[#0B0D1C] transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2">
            Features
          </a>
          <a href="#benefits" className="text-sm font-body text-[#5C6178] hover:text-[#0B0D1C] transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2">
            Benefits
          </a>
          <Link to="/login" className="text-sm font-body text-[#5C6178] hover:text-[#0B0D1C] transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2">
            Sign In
          </Link>
          <Link
            to="/signup"
            onClick={handleGetStarted}
            className="inline-flex items-center justify-center h-10 px-5 bg-gradient-to-r from-[#3E63FF] via-[#8B3FE8] to-[#E23FA0] text-white font-body font-semibold text-sm rounded-full shadow-[0_6px_18px_rgba(139,63,232,0.3)] hover:shadow-[0_10px_28px_rgba(139,63,232,0.4)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile nav toggle */}
        <button
          type="button"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-nav"
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#E7E9F3] bg-white text-[#0B0D1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2"
        >
          {mobileNavOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </motion.header>

      {/* Mobile nav panel */}
      {mobileNavOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="sticky top-[72px] z-40 md:hidden mx-6 mb-4 flex flex-col gap-1 rounded-2xl border border-[#E7E9F3] bg-white/95 backdrop-blur-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
        >
          <a
            href="#features"
            onClick={() => setMobileNavOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-body text-[#5C6178] hover:bg-[#FCFCFF] hover:text-[#0B0D1C] transition-colors"
          >
            Features
          </a>
          <a
            href="#benefits"
            onClick={() => setMobileNavOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-body text-[#5C6178] hover:bg-[#FCFCFF] hover:text-[#0B0D1C] transition-colors"
          >
            Benefits
          </a>
          <Link
            to="/login"
            onClick={() => setMobileNavOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-body text-[#5C6178] hover:bg-[#FCFCFF] hover:text-[#0B0D1C] transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            onClick={handleGetStarted}
            className="mt-2 inline-flex items-center justify-center h-10 px-5 bg-gradient-to-r from-[#3E63FF] via-[#8B3FE8] to-[#E23FA0] text-white font-body font-semibold text-sm rounded-full"
          >
            Get Started
          </Link>
        </nav>
      )}

      <main id="main-content" className="scroll-smooth">
        {/* Hero Section - Natural height for scrolling */}
        <section className="relative z-10 px-4 pt-16 pb-16 text-center">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2541D6] to-[#6B21D9] shadow-[0_10px_30px_rgba(107,33,217,0.35)] flex items-center justify-center">
                <FiMessageCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-[#2541D6] via-[#6B21D9] to-[#8B5CF6] bg-clip-text text-transparent mb-6 max-w-4xl mx-auto">
              Your AI Legal Assistant for Indian Law
            </h1>

            <p className="text-lg md:text-xl text-[#5C6178] font-body mb-4 max-w-2xl mx-auto">
              Get instant clarification on the IPC, BNS and CrPC, analyze documents and receive
              AI-powered guidance, available around the clock for professionals, students and
              everyday questions.
            </p>

            <p className="inline-flex items-center gap-2 text-xs text-[#5C6178] font-body mb-10 max-w-xl mx-auto">
              <FiInfo className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              AlphaLegalGPT provides general legal information, not a substitute for advice from a
              licensed advocate.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center">
              <Link
                to="/signup"
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center h-12 px-8 bg-gradient-to-r from-[#3E63FF] via-[#8B3FE8] to-[#E23FA0] text-white font-body font-semibold text-base rounded-full shadow-[0_8px_24px_rgba(139,63,232,0.35)] hover:shadow-[0_12px_40px_rgba(139,63,232,0.45)] transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2"
              >
                Get Started
                <FiArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center h-12 px-8 bg-white border border-[#E7E9F3] text-[#0B0D1C] font-body font-medium text-base rounded-full hover:border-[#2541D6]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-display font-bold bg-gradient-to-r from-[#2541D6] to-[#6B21D9] bg-clip-text text-transparent mb-1">
                  24/7
                </div>
                <div className="text-sm text-[#5C6178] font-body">Availability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold bg-gradient-to-r from-[#2541D6] to-[#6B21D9] bg-clip-text text-transparent mb-1">
                  Instant
                </div>
                <div className="text-sm text-[#5C6178] font-body">Response time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold bg-gradient-to-r from-[#2541D6] to-[#6B21D9] bg-clip-text text-transparent mb-1">
                  Encrypted
                </div>
                <div className="text-sm text-[#5C6178] font-body">Data protection</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-20 px-4 md:px-12 bg-white/60 backdrop-blur-xl scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0B0D1C] mb-4">
                Powerful features
              </h2>
              <p className="text-lg text-[#5C6178] font-body max-w-2xl mx-auto">
                Everything you need for intelligent legal assistance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white border border-[#E7E9F3] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2541D6]/10 to-[#6B21D9]/10 flex items-center justify-center mb-4" aria-hidden="true">
                    <feature.icon className="w-6 h-6 text-[#2541D6]" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-[#0B0D1C] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#5C6178] font-body">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="relative z-10 py-20 px-4 md:px-12 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0B0D1C] mb-6">
                  Why choose AlphaLegalGPT?
                </h2>
                <p className="text-lg text-[#5C6178] font-body mb-8">
                  Our platform combines an AI model tuned on Indian law with careful security
                  practices, so you get answers you can trust and data that stays yours.
                </p>

                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#2541D6] to-[#6B21D9] flex items-center justify-center mt-0.5" aria-hidden="true">
                        <FiCheck className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[#0B0D1C] font-body text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <div className="relative bg-white border border-[#E7E9F3] rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E7E9F3]">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2541D6] to-[#6B21D9] flex items-center justify-center" aria-hidden="true">
                      <FiMessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-semibold text-[#0B0D1C]">AI Legal Assistant</h3>
                      <p className="text-xs text-[#5C6178] font-body">Online, ready to help</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#FCFCFF] border border-[#E7E9F3] rounded-xl p-4 max-w-[85%]">
                      <p className="text-sm text-[#0B0D1C] font-body">
                        What's the difference between a bailable and non-bailable offence under
                        the BNS?
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-[#2541D6] to-[#6B21D9] text-white rounded-xl p-4 max-w-[85%] ml-auto">
                      <p className="text-sm font-body">
                        In a bailable offence, bail is a matter of right and police can grant it
                        directly. In a non-bailable offence, it's at the court's discretion and
                        the severity of the alleged act plays a central role...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-20 px-4 md:px-12 bg-gradient-to-br from-[#2541D6]/5 via-[#6B21D9]/5 to-[#8B5CF6]/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0B0D1C] mb-4">
              Ready to transform your legal workflow?
            </h2>
            <p className="text-lg text-[#5C6178] font-body mb-8 max-w-2xl mx-auto">
              Join legal professionals, students and everyday users who rely on AlphaLegalGPT
              for fast, well-grounded legal information.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center h-12 px-10 bg-gradient-to-r from-[#3E63FF] via-[#8B3FE8] to-[#E23FA0] text-white font-body font-semibold text-base rounded-full shadow-[0_8px_24px_rgba(139,63,232,0.35)] hover:shadow-[0_12px_40px_rgba(139,63,232,0.45)] transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2"
              >
                Start free trial
                <FiArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center h-12 px-10 bg-white border border-[#E7E9F3] text-[#0B0D1C] font-body font-medium text-base rounded-full hover:border-[#2541D6]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-4 md:px-12 border-t border-[#E7E9F3]">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2">
              <img
                src="/AlphaLegalGPT_Logo.png"
                alt="AlphaLegalGPT logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-base font-display font-semibold text-[#0B0D1C]">AlphaLegalGPT</span>
            </Link>

            <nav aria-label="Footer" className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-[#5C6178] hover:text-[#0B0D1C] font-body transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-[#5C6178] hover:text-[#0B0D1C] font-body transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-sm text-[#5C6178] hover:text-[#0B0D1C] font-body transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B21D9] focus-visible:ring-offset-2">
                Contact
              </Link>
            </nav>
          </div>

          <p className="text-xs text-[#8A8FA3] font-body max-w-3xl">
            AlphaLegalGPT provides general legal information for educational purposes and does
            not constitute legal advice. For advice on a specific matter, please consult a
            licensed advocate.
          </p>

          <div className="text-sm text-[#5C6178] font-body">
            © {currentYear} AlphaLegalGPT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;