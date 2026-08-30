import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({ onGetStarted }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
  };

  // Enable scrolling on body for landing page (override global overflow: hidden)
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Replicate the scroll / intersection animations from code.html
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const paths = entry.target.querySelectorAll('.animated-path');
          if (entry.isIntersecting) {
            paths.forEach((path) => path.classList.add('visible'));
          } else {
            paths.forEach((path) => path.classList.remove('visible'));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    document.querySelectorAll('.scroll-anim-container').forEach((container) => {
      observer.observe(container);
    });

    const handleScroll = () => {
      document.querySelectorAll('.scroll-anim-container svg').forEach((svg) => {
        const rect = svg.getBoundingClientRect();
        const containerTop = rect.top + window.scrollY;
        const distance = window.scrollY - containerTop + window.innerHeight;
        if (distance > 0 && distance < window.innerHeight + rect.height) {
          const yOffset = distance * 0.05;
          svg.style.transform = `translateY(${yOffset}px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleGetStarted = () => {
    setMobileNavOpen(false);
    if (typeof onGetStarted === 'function') {
      onGetStarted();
    }
  };

  const navLinks = [
    { label: 'Platform', href: '#platform', icon: 'dashboard' },
    { label: 'How it Works', href: '#how-it-works', icon: 'account_tree' },
    { label: 'Pricing', href: '#pricing', icon: 'payments' },
  ];

  // Close mobile menu with Escape key
  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  // Close mobile menu when viewport grows to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileNavOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-mesh text-on-background font-body-md antialiased overflow-x-hidden">
      {/* Skip link for keyboard and screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2 focus:text-sm focus:text-on-primary"
      >
        Skip to main content
      </a>
      
      {/* ============ TopNavBar ============ */}
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] md:w-[calc(100%-40px)] max-w-container-max rounded-full border border-white/20 shadow-lg shadow-primary/5 bg-surface/70 backdrop-blur-xl flex justify-between items-center px-4 sm:px-6 md:px-8 py-2.5 md:py-3 z-50 transition-all">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="w-10 h-10 md:w-12 md:h-12 shrink-0" aria-label="AlphaLegalGPT home">
                <img src="/AlphaLegalGPT_Logo.png" alt="AlphaLegalGPT Logo" className="w-full h-full object-contain" />
            </Link>
            <Link
              to="/"
              className="font-display-lg text-[17px] md:text-headline-sm font-bold tracking-tight text-primary whitespace-nowrap"
              aria-label="AlphaLegalGPT home"
            >
              AlphaLegalGPT
            </Link>
          </div>
          <div className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-on-surface-variant hover:text-primary transition-colors text-label-md font-label-md"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            to="/login"
            className="hidden md:block text-label-md font-label-md text-on-surface hover:text-primary transition-colors px-4 py-2 border border-outline-variant rounded-full"
          >
            Login
          </Link>
          <Link
            to="/signup"
            onClick={handleGetStarted}
            className="hidden md:block text-label-md font-label-md bg-primary text-on-primary hover:bg-secondary transition-colors px-6 py-2 rounded-full shadow-[0_0_15px_rgba(0,74,198,0.3)]"
          >
            Get Started
          </Link>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden relative p-2 rounded-full hover:bg-surface-container active:bg-surface-container-high transition-colors text-on-surface"
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <span
              className={`material-symbols-outlined block transition-transform duration-300 ${mobileNavOpen ? 'rotate-90' : 'rotate-0'}`}
            >
              {mobileNavOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile nav backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile nav dropdown */}
      <div
        id="mobile-nav-menu"
        className={`fixed top-[88px] left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-sm z-40 md:hidden transition-all duration-300 ease-out origin-top ${
          mobileNavOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
        }`}
        aria-hidden={!mobileNavOpen}
      >
        <div className="glass-panel rounded-3xl p-3 shadow-2xl border border-white/20 flex flex-col">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileNavOpen(false)}
              style={{ transitionDelay: mobileNavOpen ? `${100 + i * 50}ms` : '0ms' }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-label-md text-[15px] text-on-surface hover:bg-surface-container-low active:bg-surface-container-high transition-all duration-300 ${
                mobileNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <span className="w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">{link.icon}</span>
              </span>
              {link.label}
              <span className="material-symbols-outlined ml-auto text-on-surface-variant/60 text-[20px]">
                chevron_right
              </span>
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-outline-variant/20">
            <Link
              to="/login"
              onClick={() => setMobileNavOpen(false)}
              style={{ transitionDelay: mobileNavOpen ? '250ms' : '0ms' }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-label-md font-label-md text-on-surface border border-outline-variant hover:bg-surface-container-low active:bg-surface-container-high transition-all duration-300 ${
                mobileNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Login
            </Link>
            <Link
              to="/signup"
              onClick={handleGetStarted}
              style={{ transitionDelay: mobileNavOpen ? '300ms' : '0ms' }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-label-md font-label-md bg-primary text-on-primary hover:bg-secondary shadow-[0_0_15px_rgba(0,74,198,0.3)] transition-all duration-300 ${
                mobileNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <main id="main-content">
        {/* ============ Hero Section ============ */}
        <section className="scroll-anim-container relative min-h-[800px] flex items-center pt-28 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center w-full">
            {/* Left Content */}
            <div className="flex flex-col gap-6 z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high/50 border border-outline-variant/20 w-max">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                  local_police
                </span>
                <span className="text-label-sm font-label-sm text-primary">India's AI-Powered Legal Assistant</span>
              </div>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
                Understand <br className="hidden md:block" />
                <span className="gradient-text">Indian Law</span> in <br className="hidden md:block" />
                Seconds with AI
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Instantly decode BNS, IPC, CrPC, and complex contracts. Get reliable, precise legal explanations tailored
                for professionals and citizens alike. Powered by advanced AI trained specifically on Indian
                jurisprudence for unparalleled accuracy — available 24/7.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  to="/signup"
                  onClick={handleGetStarted}
                  className="bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-xl shadow-[0_4px_20px_rgba(0,74,198,0.3)] hover:-translate-y-1 transition-transform flex items-center gap-2"
                >
                  Start Free Trial
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <a href="#how-it-works" className="bg-surface glass-panel text-on-surface font-label-md text-label-md px-8 py-4 rounded-xl hover:bg-surface-container-low transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">play_circle</span>
                  See How It Works
                </a>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-[500px] w-full mt-6 lg:mt-0">
              {/* Dashboard Mockup */}
              <div className="absolute inset-0 glass-panel rounded-3xl p-6 shadow-2xl flex flex-col z-10 border border-white/50">
                {/* Mockup Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-label-md font-semibold">AlphaLegal Chat</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-error"></div>
                    <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                    <div className="w-3 h-3 rounded-full bg-surface-container-highest"></div>
                  </div>
                </div>
                {/* Chat Area */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
                  {/* User Message */}
                  <div className="self-end bg-surface-container-low p-4 rounded-2xl rounded-tr-sm max-w-[80%] border border-outline-variant/10">
                    <p className="font-body-md text-body-md text-on-surface">
                      What's the difference between a bailable & non-bailable offence under the new BNS ?
                    </p>
                  </div>

                  {/* AI Response */}
                  <div className="self-start glass-panel p-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm relative">
                    <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-secondary pulse-ring"></div>
                    <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-secondary"></div>
                    <p className="font-body-md text-body-md text-on-surface mb-3">
                      Under Indian Law, the distinction primarily lies in the right to bail:
                    </p>
                    <ul className="font-body-md text-body-md text-on-surface-variant space-y-2 list-disc pl-4">
                      <li>
                        <strong className="text-primary">Bailable Offence:</strong> Bail is a matter of right. Granted by
                        the police officer or court (e.g., Simple hurt).
                      </li>
                      <li>
                        <strong className="text-secondary">Non-Bailable Offence:</strong> Bail is a matter of discretion
                        by the court. (e.g., Murder, Rape).
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Input Area Mock */}
                <div className="mt-4 p-2 rounded-xl bg-surface-container border border-outline-variant/20 flex justify-between items-center">
                  <span className="text-outline font-body-md text-body-md">Ask a legal question...</span>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-sm">send</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ Trust Bar ============ */}
        <section className="py-12 px-margin-mobile md:px-margin-desktop border-y border-outline-variant/20 bg-surface">
          <div className="max-w-container-max mx-auto">
            <p className="text-center font-label-md text-label-md text-on-surface-variant mb-8">
              Trusted by legal professionals across India
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {['Supreme Court Bar Association', 'Delhi High Court', 'NLSIU Bangalore', 'Indian Law Institute', 'Bar Council of India'].map((name) => (
                <div key={name} className="flex items-center gap-2 text-on-surface-variant/60 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                  <span className="font-label-md text-label-md whitespace-nowrap">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ Features In Action Section ============ */}
        <section id="platform" className="scroll-anim-container py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest/50 relative overflow-hidden">
          <div className="semi-circle-top"></div>
          <div className="max-w-container-max mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Features in Action</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Explore our suite of specialized AI tools designed to streamline your legal workflow.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Large Hero Feature Card (Left) */}
              <div className="lg:col-span-7 glass-panel rounded-[40px] p-8 md:p-12 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                  <div className="w-[400px] h-[400px] rounded-full border border-primary/30 border-dashed absolute -right-20 -bottom-20 animate-[spin_60s_linear_infinite]"></div>
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
                    <span className="material-symbols-outlined text-3xl">library_books</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4">BNS Reference Guide</h3>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg">
                    Seamlessly cross-reference old IPC sections with the new Bharatiya Nyaya Sanhita. Get comparative
                    analysis and relevant precedents instantly with our proprietary mapping engine.
                  </p>

                  <div className="mt-auto bg-surface-container-high/50 rounded-2xl border border-outline-variant/30 p-6 shadow-inner">
                    <div className="flex items-center gap-4 mb-4 border-b border-outline-variant/20 pb-4">
                      <div className="px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold">IPC 302</div>
                      <span className="material-symbols-outlined text-outline">trending_flat</span>
                      <div className="px-3 py-1 bg-secondary/10 rounded-full text-secondary text-xs font-bold">BNS 101</div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 w-full bg-outline-variant/20 rounded-full"></div>
                      <div className="h-2 w-5/6 bg-outline-variant/20 rounded-full"></div>
                      <div className="h-2 w-4/6 bg-outline-variant/20 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Stacked Cards (Right) */}
              <div id="case-logic" className="lg:col-span-5 flex flex-col gap-8">
                {/* Contract Risk Card */}
                <div className="glass-panel rounded-[40px] p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 flex-1">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center mb-6 shadow-lg shadow-secondary/20">
                      <span className="material-symbols-outlined text-2xl">fact_check</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Contract Risk Scorecard</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                      Automated risk assessment for legal agreements. Highlights ambiguous clauses and compliance gaps.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-error w-3/4"></div>
                      </div>
                      <span className="text-xs font-bold text-error">High Risk</span>
                    </div>
                  </div>
                </div>

                {/* Case Summaries Card */}
                <div className="glass-panel rounded-[40px] p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 flex-1">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center mb-6 shadow-lg shadow-tertiary/20">
                      <span className="material-symbols-outlined text-2xl">summarize</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">AI Case Summaries</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                      Digest 100-page Supreme Court judgments in minutes with concise headnotes.
                    </p>
                    <div className="flex gap-2">
                      <div className="h-1 w-8 bg-tertiary/30 rounded-full"></div>
                      <div className="h-1 w-12 bg-tertiary/30 rounded-full"></div>
                      <div className="h-1 w-6 bg-tertiary/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ How it Works Section ============ */}
        <section id="how-it-works" className="scroll-anim-container py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">How it Works</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Four simple steps to transform your legal research and document analysis.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-outline-variant/30 z-0"></div>
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full glass-panel shadow-lg flex items-center justify-center mb-6 border-2 border-primary/20 relative bg-surface">
                <div className="absolute inset-1 rounded-full border border-primary/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
                <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
              </div>
              <h4 className="font-headline-sm text-lg font-bold text-on-surface mb-2">1. Upload or Query</h4>
              <p className="font-body-md text-sm text-on-surface-variant">
                Type your complex legal question or securely upload your draft documents.
              </p>
            </div>
            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center mt-8 md:mt-0">
              <div className="w-20 h-20 rounded-full glass-panel shadow-lg flex items-center justify-center mb-6 border-2 border-secondary/20 relative bg-surface">
                <div className="absolute inset-1 rounded-full border border-secondary/30 border-dashed animate-[spin_10s_linear_infinite_reverse]"></div>
                <span className="material-symbols-outlined text-secondary text-3xl">psychology</span>
              </div>
              <h4 className="font-headline-sm text-lg font-bold text-on-surface mb-2">2. AI Analysis</h4>
              <p className="font-body-md text-sm text-on-surface-variant">
                Our India-specific AI engine analyzes the input against thousands of statutes and precedents.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center mt-8 md:mt-0">
              <div className="w-20 h-20 rounded-full glass-panel shadow-lg flex items-center justify-center mb-6 border-2 border-tertiary/20 relative bg-surface">
                <div className="absolute inset-1 rounded-full border border-tertiary/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
                <span className="material-symbols-outlined text-tertiary text-3xl">lightbulb</span>
              </div>
              <h4 className="font-headline-sm text-lg font-bold text-on-surface mb-2">3. Gain Clarity</h4>
              <p className="font-body-md text-sm text-on-surface-variant">
                Receive precise, easy-to-understand explanations and actionable insights.
              </p>
            </div>
            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center text-center mt-8 md:mt-0">
              <div className="w-20 h-20 rounded-full glass-panel shadow-lg flex items-center justify-center mb-6 border-2 border-primary/20 relative bg-surface">
                <div className="absolute inset-1 rounded-full border border-primary/30 border-dashed animate-[spin_10s_linear_infinite_reverse]"></div>
                <span className="material-symbols-outlined text-primary text-3xl">draw</span>
              </div>
              <h4 className="font-headline-sm text-lg font-bold text-on-surface mb-2">4. Draft &amp; Finalize</h4>
              <p className="font-body-md text-sm text-on-surface-variant">
                Use AI suggestions to perfect your drafts, backed by solid legal reasoning.
              </p>
            </div>
          </div>
        </section>

        {/* ============ Features Section (Bento Grid) ============ */}
        <section id="features" className="scroll-anim-container py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest/50 relative overflow-hidden">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Comprehensive Legal Intelligence</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Powerful AI tools designed specifically for the complexities of the Indian judicial system. Our models are
              continuously updated with the latest gazette notifications and supreme court judgments.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-auto md:auto-rows-[300px]">
            {/* Large Feature 1 */}
            <div className="md:col-span-2 md:row-span-1 glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                  Instant Legal Clarification &amp; Research
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-4">
                  Get immediate, accurate interpretations of statutes, case laws, and legal concepts without spending
                  hours in the library. Our AI cross-references multiple sources to provide a synthesized, reliable
                  answer.
                </p>

                <ul className="text-sm text-on-surface-variant space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">check</span> Natural Language
                    Queries
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">check</span> Citation Generation
                  </li>
                </ul>
              </div>
            </div>
            {/* Small Feature 1 */}
            <div className="md:col-span-1 md:row-span-1 glass-panel rounded-[40px] p-6 sm:p-8 flex flex-col items-center justify-start text-center relative overflow-hidden bg-gradient-to-b from-surface/50 to-surface-container-high/30 min-h-[240px] md:min-h-0">
              <div className="w-16 h-16 shrink-0 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary text-3xl">shield_locked</span>
              </div>
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-2">Secure &amp; Private</h3>
              <p className="font-body-md text-[14px] text-on-surface-variant mb-4">
                Bank-grade AES-256 encryption for all your sensitive legal queries. Data sovereignty guaranteed.
              </p>
              <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-1 rounded-full mt-auto">
                ISO 27001 Compliant
              </span>
            </div>

            {/* Small Feature 2 */}
            <div className="md:col-span-1 md:row-span-1 glass-panel rounded-[40px] p-6 sm:p-8 flex flex-col items-center justify-start text-center relative overflow-hidden bg-gradient-to-b from-surface/50 to-surface-container-high/30 min-h-[240px] md:min-h-0">
              <div className="w-16 h-16 shrink-0 rounded-full bg-tertiary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-tertiary text-3xl">translate</span>
              </div>
              <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-2">Multilingual Support</h3>
              <p className="font-body-md text-[14px] text-on-surface-variant mb-4">
                Query in English, Hindi, Tamil, or Bengali. Get responses in your preferred language for clarity.
              </p>
              <span className="text-xs font-semibold text-tertiary bg-tertiary/10 px-2 py-1 rounded-full mt-auto">
                12+ Indian Languages
              </span>
            </div>
            
            {/* Large Feature 2 */}
            <div className="md:col-span-2 md:row-span-1 glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden flex items-center justify-between">
              <div className="max-w-sm z-10">
                <div className="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-tertiary/20">
                  <span className="material-symbols-outlined">history_edu</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                  Advanced Draft Review &amp; Generation
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                  Elevate your drafting with AI suggestions and comprehensive case law research assistance. Generate
                  structured outlines for complex arguments.
                </p>

                <ul className="text-sm text-on-surface-variant space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">check</span> Tone Adjustment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">check</span> Argument Structuring
                  </li>
                </ul>
              </div>
              {/* Decorative Graphic */}
              <div className="hidden md:flex gap-4 relative z-0 opacity-80 right-8">
                <div className="w-24 h-32 rounded-lg bg-surface border border-outline-variant/30 shadow-md transform rotate-[-5deg] flex flex-col p-2 gap-2">
                  <div className="h-2 w-full bg-surface-container-highest rounded"></div>
                  <div className="h-2 w-3/4 bg-surface-container-highest rounded"></div>
                </div>
                <div className="w-24 h-32 rounded-lg bg-primary text-on-primary shadow-xl transform rotate-[5deg] flex flex-col p-2 gap-2 mt-4 relative z-10">
                  <div className="h-2 w-full bg-on-primary/20 rounded"></div>
                  <div className="h-2 w-full bg-on-primary/20 rounded"></div>
                  <div className="h-2 w-1/2 bg-on-primary/20 rounded"></div>
                  <div className="mt-auto self-end">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ Testimonials Section ============ */}
        <section className="scroll-anim-container py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Loved by Legal Professionals</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              See what lawyers, judges, and law students across India are saying about AlphaLegalGPT.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "AlphaLegalGPT cut my research time by 70%. The BNS-IPC mapping feature alone is worth its weight in gold for any practicing advocate today.",
                name: "Adv. Priya Sharma",
                role: "Senior Advocate, Delhi High Court",
                icon: "gavel",
              },
              {
                quote: "As a law student, I can now understand complex Supreme Court judgments in minutes. The AI summaries and citation generation are incredibly accurate.",
                name: "Rahul Mehta",
                role: "Final Year, NLSIU Bangalore",
                icon: "school",
              },
              {
                quote: "We integrated AlphaLegalGPT across our 40-lawyer firm. Contract review that used to take days now happens in hours, with better risk coverage.",
                name: "Sneha Kapoor",
                role: "Managing Partner, Kapoor & Associates",
                icon: "business",
              },
            ].map((t, i) => (
              <div key={i} className="glass-panel rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                <span className="material-symbols-outlined text-primary/10 text-6xl absolute top-4 right-4" aria-hidden="true">format_quote</span>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  ))}
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-1 relative z-10">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/20">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">{t.icon}</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-on-surface">{t.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ Pricing Section ============ */}
        <section id="pricing" className="scroll-anim-container py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest/50 relative overflow-hidden">
          <div className="max-w-container-max mx-auto relative z-10">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Simple, Transparent Pricing</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Start free. Upgrade when you need more power. No hidden fees, cancel anytime.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Starter',
                  price: 'Free',
                  period: 'forever',
                  description: 'Perfect for exploring AI-powered legal research.',
                  features: ['50 queries/month', 'Basic legal research', 'BNS-IPC reference', 'Email support'],
                  cta: 'Get Started Free',
                  highlight: false,
                },
                {
                  name: 'Professional',
                  price: '₹999',
                  period: '/month',
                  description: 'For practicing advocates and law firms.',
                  features: ['Unlimited queries', 'Contract risk analysis', 'AI case summaries', 'Draft review & generation', 'Multilingual support', 'Priority support'],
                  cta: 'Start Free Trial',
                  highlight: true,
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  period: 'pricing',
                  description: 'For large firms and legal departments.',
                  features: ['Everything in Pro', 'Custom AI training', 'API access', 'Dedicated account manager', 'SLA guarantee', 'On-premise deployment'],
                  cta: 'Contact Sales',
                  highlight: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl p-8 flex flex-col relative overflow-hidden ${
                    plan.highlight
                      ? 'bg-primary text-on-primary ring-2 ring-primary shadow-2xl shadow-primary/20 scale-[1.02]'
                      : 'glass-panel text-on-surface'
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute top-4 right-4 text-xs font-bold bg-on-primary text-primary px-3 py-1 rounded-full">Most Popular</span>
                  )}
                  <h3 className="font-headline-sm text-headline-sm font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-display-lg text-display-lg-mobile font-bold">{plan.price}</span>
                    <span className={`font-label-md text-label-md ${plan.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{plan.period}</span>
                  </div>
                  <p className={`font-body-md text-body-md mb-6 ${plan.highlight ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                    {plan.description}
                  </p>
                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>{plan.highlight ? 'check_circle' : 'check'}</span>
                        <span className="font-body-md text-body-md">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    className={`block text-center px-6 py-3 rounded-full font-label-md text-label-md transition-colors ${
                      plan.highlight
                        ? 'bg-on-primary text-primary hover:bg-surface'
                        : 'bg-primary text-on-primary hover:bg-secondary'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ Final CTA Section ============ */}
        <section className="scroll-anim-container py-section-gap px-margin-mobile md:px-margin-desktop relative overflow-hidden">
          <div className="max-w-container-max mx-auto">
            <div className="relative rounded-[40px] bg-gradient-to-br from-primary to-secondary p-12 md:p-20 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full border border-white/30 border-dashed animate-[spin_30s_linear_infinite]"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full border border-white/20 border-dashed animate-[spin_40s_linear_infinite_reverse]"></div>
              </div>
              <div className="relative z-10">
                <h2 className="font-headline-md text-headline-md text-on-primary mb-4">
                  Ready to Transform Your Legal Practice?
                </h2>
                <p className="font-body-lg text-body-lg text-on-primary/80 max-w-2xl mx-auto mb-8">
                  Join hundreds of legal professionals who are saving time, reducing costs, and delivering better outcomes with AlphaLegalGPT.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/signup"
                    className="bg-on-primary text-primary font-label-md text-label-md px-8 py-4 rounded-xl hover:bg-surface transition-colors flex items-center gap-2 shadow-lg"
                  >
                    Start Your Free Trial
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                  <Link
                    to="/contact"
                    className="border border-on-primary/40 text-on-primary font-label-md text-label-md px-8 py-4 rounded-xl hover:bg-on-primary/10 transition-colors flex items-center gap-2"
                  >
                    Talk to Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>


      {/* ============ Footer ============ */}
      <footer className="w-full pt-section-gap pb-10 border-t border-outline-variant/20 bg-surface relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary/5 pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-secondary/5 pointer-events-none"></div>

        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-gutter lg:gap-8 pb-10">
            {/* Brand Column */}
            <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-4">
              <Link to="/" className="flex items-center gap-3" aria-label="AlphaLegalGPT home">
                <img src="/AlphaLegalGPT_Logo.png" alt="AlphaLegalGPT Logo" className="w-12 h-12" />
                <span className="font-display-lg text-headline-sm font-bold tracking-tight text-primary">
                  AlphaLegalGPT
                </span>
              </Link>
              <p className="text-on-surface-variant font-body-md text-body-md max-w-sm">
                Advancing legal intelligence with precision. Empowering Indian legal professionals with state-of-the-art AI.
              </p>

              {/* Contact info */}
              <ul className="flex flex-col gap-2.5 text-on-surface-variant font-body-md text-body-md">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
                  <span>Tamil Nadu, India</span>
                </li>
              </ul>
            </div>

            {/* Product Links */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-2">Product</h4>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Platform</Link>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Features</Link>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Pricing</Link>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Changelog</Link>
            </div>
{/* Company Links */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-2">Company</h4>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">About Us</Link>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Careers</Link>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Help Center</Link>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Contact</Link>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-2">Legal</h4>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Privacy Policy</Link>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Terms of Service</Link>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Legal Disclaimer</Link>
              <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md opacity-80 hover:opacity-100">Security</Link>
            </div>

            {/* Newsletter Column */}
            <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-2">
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-1">Stay Updated</h4>
              <p className="text-on-surface-variant font-body-md text-[14px] leading-5">
                Product news and legal-tech insights, delivered monthly.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-primary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Thanks! You're subscribed.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    aria-label="Email address"
                    className="px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/40 text-body-md text-[14px] placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-outline-variant/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <p className="text-outline font-label-md text-label-md">
                © {currentYear} AlphaLegalGPT. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <Link to="#" className="text-outline hover:text-primary transition-colors font-label-md text-label-md">
                Privacy
              </Link>
              <Link to="#" className="text-outline hover:text-primary transition-colors font-label-md text-label-md">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;