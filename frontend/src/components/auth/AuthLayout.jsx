import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-mesh p-4 relative overflow-hidden">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="bg-orb bg-orb-1" style={{ top: '-12rem', left: '-8rem' }} />
        <div className="bg-orb bg-orb-2" style={{ bottom: '-10rem', right: '-8rem' }} />
        <div className="bg-orb bg-orb-3" style={{ top: '30%', left: '65%', width: '30rem', height: '30rem' }} />
        <div className="absolute top-1/3 left-1/4 w-56 h-56 rounded-full border border-[#2541D6]/10 animate-spin-slow" />
      </div>

      {/* Background treatment */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.8%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27120%27 height=%27120%27 filter=%27url(%23n)%27 opacity=%270.45%27/%3E%3C/svg%3E")',
          }}
        />

        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-60 -left-60 w-[52rem] h-[52rem] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(62,99,255,0.35) 0%, rgba(62,99,255,0) 60%)',
            filter: 'blur(130px)',
          }}
        />

        <motion.div
          animate={{ x: [0, -16, 0], y: [0, 14, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-56 -right-64 w-[58rem] h-[58rem] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(139,63,232,0.25) 0%, rgba(139,63,232,0) 60%)',
            filter: 'blur(140px)',
          }}
        />
      </div>

      {/* Auth Card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;