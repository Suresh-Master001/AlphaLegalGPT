import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden bg-[#FCFCFF]">
      {/* Background treatment - Aurora mesh blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* subtle fine grain to keep gradients tactile */}
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
            background:
              'radial-gradient(circle at center, rgba(62,99,255,0.55) 0%, rgba(62,99,255,0) 60%)',
            filter: 'blur(130px)',
          }}
        />

        <motion.div
          animate={{ x: [0, -16, 0], y: [0, 14, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-56 -right-64 w-[58rem] h-[58rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle at center, rgba(139,63,232,0.45) 0%, rgba(139,63,232,0) 60%)',
            filter: 'blur(140px)',
          }}
        />

        <motion.div
          animate={{ x: [0, 14, 0], y: [0, 10, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-28 right-[-20rem] w-[44rem] h-[44rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle at center, rgba(226,63,160,0.3) 0%, rgba(226,63,160,0) 60%)',
            filter: 'blur(150px)',
          }}
        />
      </div>

      {/* Scrollable content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 min-h-full flex items-center justify-center p-4 py-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
          className="w-full max-w-md"
        >
          <div className="mb-7 text-center">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-gradient-to-br from-[#3E63FF]/20 via-[#8B3FE8]/20 to-[#E23FA0]/20 blur-3xl" />
              <img
                src="/AlphaLegalGPT_Logo.png"
                alt="AlphaLegalGPT"
                className="relative w-12 h-12 object-contain"
              />
            </div>

            <h1 className="text-2xl font-display font-bold text-[#14141F] mb-2">
              AlphaLegalGPT
            </h1>

            {subtitle && (
              <p className="text-[#63637A] text-sm font-body">{subtitle}</p>
            )}
          </div>

          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
