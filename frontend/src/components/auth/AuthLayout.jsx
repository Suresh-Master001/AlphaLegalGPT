import React from 'react';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/90 via-slate-900 to-teal-900/90 flex items-center justify-center p-4 py-8 relative">
      {/* Ambient particles */}
      <div className="absolute inset-0">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/25 rounded-full"
            style={{ left: `${i * 6}%`, top: `${i * 7}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 w-[90%] max-w-5xl"> 
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle ? <p className="text-white-60 text-sm mt-2">{subtitle}</p> : null}
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;