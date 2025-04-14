import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from "@/renderer/lib/utils";

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "default", 
  className 
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-8 h-8"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={cn(sizeClasses[size], className, "animate-spin")} />
      </motion.div>
    </motion.div>
  );
};