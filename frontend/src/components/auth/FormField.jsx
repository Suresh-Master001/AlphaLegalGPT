import React from 'react';
import { motion } from 'framer-motion';

const FormField = ({ label, icon: Icon, children }) => {
  return (
    <div>
      <label className="block text-white-80 text-sm font-medium mb-3 flex items-center gap-2">
        {Icon ? <Icon className="w-5 h-5" /> : null}
        {label}
      </label>
      <motion.div whileFocus={{ scale: 1.02 }} className="relative">
        {children}
      </motion.div>
    </div>
  );
};

export default FormField;