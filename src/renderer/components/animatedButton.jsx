import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({ children, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-primary-blue text-white p-2 rounded"
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;