import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from "@/renderer/lib/utils";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn("bg-primary-blue text-white p-2 rounded", className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;