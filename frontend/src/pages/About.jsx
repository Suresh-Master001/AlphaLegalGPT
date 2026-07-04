import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function About({ onGetStarted }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  React.useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'hidden'; };
  }, []);

  const features = [
    { 
      icon: '⚖️', 
      title: 'Comprehensive Indian Legal Database', 
      desc: 'Access to IPC 1860, BNS 2023, and CrPC with 512+ meticulously documented legal sections.',
      details: 'Complete coverage of Indian Penal Code, Bharatiya Nyaya Sanhita 2023, and CrPC with detailed descriptions and punishments.'
    },
    { 
      icon: '💬', 
      title: 'Real-time Streaming Responses', 
      desc: 'Experience instant AI-powered answers with live typewriter streaming effect.',
      details: 'Powered by Google Gemini Flash, watch answers unfold token-by-token for natural conversation flow.'
    },
    { 
      icon: '🔒', 
      title: 'Enterprise-Grade Security', 
      desc: 'Email OTP verification, JWT authentication, and secure password hashing.',
      details: 'Bcrypt password encryption, JWT session management, and secure OTP delivery via Nodemailer.'
    },
    { 
      icon: '🗺️', 
      title: 'Location-Based Legal Finder', 
      desc: 'Find nearby courts, police stations, and legal offices within 10km.',
      details: 'Browser geolocation integration with Google Maps for District Courts, Sessions Courts, Police Stations, and more.'
    },
    { 
      icon: '📚', 
      title: 'Intelligent Law References', 
      desc: 'Auto-detection of IPC, BNS, and CrPC sections in every response.',
      details: 'Advanced regex detection identifies legal citations and presents them in an interactive sidebar.'
    },
    { 
      icon: '🌐', 
      title: 'Multi-Language Support', 
      desc: 'Full English and Tamil language support with instant switching.',
      details: 'Seamless language switching without losing context. More languages coming soon.'
    },
  ];

  const howItWorks = [
    { step: '1', title: 'Sign Up', desc: 'Create account with email. Verify with OTP.', icon: '👤' },
    { step: '2', title: 'Ask Questions', desc: 'Type legal questions naturally. AI understands context.', icon: '💭' },
    { step: '3', title: 'Get Instant Answers', desc: 'Real-time streaming with IPC/BNS/CrPC references.', icon: '⚡' },
    { step: '4', title: 'Explore Further', desc: 'Click law references. Find nearby offices.', icon: '🔍' },
  ];

  const stats = [
    { number: '512+', label: 'Legal Sections', icon: '📖' },
    { number: '3', label: 'Law Types', icon: '⚖️' },
    { number: '2', label: 'Languages', icon: '🌍' },
    { number: '10km', label: 'Search Radius', icon: '📍' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/90 via-slate-900 to-teal-900/90 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{ duration: 10 + i, repeat: Infinity }}
            style={{
              left: `${i * 3.5}%`,
              top: `${i * 4}%`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-8xl mb-8 inline-block"
            >
              ⚖️
            </motion.div>

            {/* Main Title with gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent"
            >
              Alpha<span className="text-emerald-400">Legal</span>GPT
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-3xl text-white/90 mb-6 max-w-4xl mx-auto font-medium"
            >
              Your AI-Powered Legal Assistant for Indian Law
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base md:text-lg text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Get instant, accurate answers about Indian Penal Code, BNS 2023, and Criminal Procedure Code. 
              Find nearby courts and legal offices. Powered by Google Gemini for context-aware legal guidance.
            </motion.p>

            {/* CTA Buttons with glass morphism styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-emerald-500/40"
              >
                Get Started
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('tech')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-2xl font-bold text-lg transition-all border-2 border-white/20 hover:border-white/40"
              >
                View Tech Stack
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-3xl bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-emerald-500/50 transition-all cursor-default"
            >
              <div className="text-5xl mb-3">{stat.icon}</div>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-white/70 text-sm md:text-base font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Powerful Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white/70 text-lg max-w-2xl mx-auto"
            >
              Everything you need to navigate the Indian legal system with confidence
            </motion.p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 md:p-8 rounded-3xl border-2 border-white/10 bg-white/5 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 relative overflow-hidden"
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-sm md:text-base mb-3 leading-relaxed">
                    {feature.desc}
                  </p>
                  <p className="text-white/50 text-xs md:text-sm leading-relaxed">
                    {feature.details}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white/70 text-lg max-w-2xl mx-auto"
            >
              Get started in minutes and experience the future of legal assistance
            </motion.p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                {/* Step Card */}
                <div className="relative p-6 rounded-3xl border-2 border-white/10 bg-white/5 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300 h-full">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="text-5xl mb-4 mt-2 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 rounded-3xl blur-3xl" />
          
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-16 border-2 border-white/10">
            {/* Section Header */}
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Why Choose AlphaLegalGPT?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-white/70 text-lg max-w-2xl mx-auto"
              >
                Built with cutting-edge technology and deep legal expertise
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {[
                { icon: '🎯', title: 'Accuracy First', color: 'text-emerald-400', text: 'Our AI is trained on authentic legal documents and continuously updated with the latest legal amendments. Get reliable information about IPC, BNS 2023, and CrPC that you can trust.' },
                { icon: '⚡', title: 'Lightning Fast', color: 'text-blue-400', text: 'Real-time streaming responses mean you get information instantly. No more refreshing or waiting for pages to load. Watch answers appear as they\'re generated.' },
                { icon: '🔐', title: 'Privacy Focused', color: 'text-purple-400', text: 'Your conversations are secure. We use industry-standard encryption and authentication. Your data stays private and is never shared with third parties.' },
                { icon: '🌍', title: 'Accessible Everywhere', color: 'text-orange-400', text: 'Access legal assistance from any device, anywhere. Web-based platform means no downloads required. Find legal help whether you\'re at home, in court, or on the go.' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.03 }}
                  className="p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-emerald-500/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${item.color}`}>
                        {item.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed text-sm md:text-base">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glass card with gradient border */}
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-12 md:p-20 text-center border-2 border-emerald-500/30">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white/70 text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of users who are already using AlphaLegalGPT for their legal queries. 
              Get instant access to comprehensive Indian legal information.
            </motion.p>
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-bold text-lg md:text-xl transition-all shadow-2xl shadow-emerald-500/50"
            >
              Start Using AlphaLegalGPT
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-white/10 py-12 md:py-16 relative">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                ⚖️ AlphaLegalGPT
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Your trusted AI-powered legal assistant for Indian law. Making legal information accessible to everyone.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><button onClick={onGetStarted} className="hover:text-emerald-400 transition-colors font-medium">Get Started</button></li>
                <li><button onClick={() => setActiveTab('tech')} className="hover:text-emerald-400 transition-colors font-medium">Technology</button></li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Legal Coverage</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Indian Penal Code (IPC) 1860
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Bharatiya Nyaya Sanhita 2023
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  Code of Criminal Procedure (CrPC)
                </li>
              </ul>
            </motion.div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/70 text-sm mb-2 font-medium">
              AlphaLegalGPT - AI Legal Assistant for Indian Law
            </p>
            <p className="text-white/50 text-xs">
              Built with React, Node.js, Express, Socket.io, and Google Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Modal */}
      {activeTab === 'tech' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setActiveTab('overview')}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-8 md:p-10 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Technology Stack
              </h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('overview')}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
              >
                <span className="text-3xl">×</span>
              </motion.button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techStack.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="p-5 md:p-6 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-emerald-500/30 transition-all"
                >
                  <div className="text-sm text-emerald-400 font-bold mb-2 uppercase tracking-wider">{item.name}</div>
                  <div className="text-white font-bold text-lg mb-2">{item.tech}</div>
                  <div className="text-white/70 text-sm leading-relaxed">{item.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default About;