import React from 'react';
import { motion } from 'framer-motion';

// Efecto de hover con elevación suave
export const HoverElevation = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Efecto de hover con rotación
export const HoverRotate = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ rotate: 5, transition: { duration: 0.2 } }}
    whileTap={{ rotate: -5 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Efecto de hover con escala
export const HoverScale = ({ children, className = '', scale = 1.05 }) => (
  <motion.div
    whileHover={{ scale, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.95 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Efecto de hover con brillo
export const HoverGlow = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ 
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      transition: { duration: 0.2 }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Efecto de hover con borde
export const HoverBorder = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ 
      borderColor: 'var(--primary)',
      transition: { duration: 0.2 }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Efecto de hover con opacidad
export const HoverOpacity = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ opacity: 0.8, transition: { duration: 0.2 } }}
    className={className}
  >
    {children}
  </motion.div>
);

// Efecto de hover con color de fondo
export const HoverBackground = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ 
      backgroundColor: 'var(--accent)',
      transition: { duration: 0.2 }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Efecto de hover con desplazamiento
export const HoverSlide = ({ children, className = '', direction = 'right' }) => {
  const variants = {
    right: { x: 5 },
    left: { x: -5 },
    up: { y: -5 },
    down: { y: 5 }
  };

  return (
    <motion.div
      whileHover={variants[direction]}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Efecto de hover con rebote
export const HoverBounce = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ 
      y: -5,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }}
    whileTap={{ scale: 0.95 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Efecto de hover con pulso
export const HoverPulse = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ 
      scale: 1.05,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }}
    whileTap={{ scale: 0.95 }}
    className={className}
  >
    {children}
  </motion.div>
); 