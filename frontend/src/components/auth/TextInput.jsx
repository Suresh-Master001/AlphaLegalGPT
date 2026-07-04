import React from 'react';

const TextInput = ({ className = '', inputClassName = '', ...props }) => {
  return (
    <input
      {...props}
      className={
        "w-full h-14 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none transition-all duration-300 text-base font-semibold " +
        inputClassName +
        className
      }
    />
  );
};

export default TextInput;

