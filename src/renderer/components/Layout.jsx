import React from 'react';
import Sidebar from './Sidebar'; // Importaremos el Sidebar que crearemos
import { motion } from 'framer-motion'; // Importar motion

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-background"> {/* Usar el color de fondo base definido en tailwind.config.js */}
      <Sidebar /> {/* Barra lateral */} 
      {/* Animar el área de contenido principal */}
      <motion.main 
        className="flex-1 overflow-y-auto p-6 md:p-10"
        initial={{ opacity: 0, y: 20 }} // Estado inicial (invisible, ligeramente abajo)
        animate={{ opacity: 1, y: 0 }}   // Estado final (visible, en posición)
        transition={{ duration: 0.4, ease: "easeInOut" }} // Duración y easing
      >
        {children} {/* Aquí se renderizarán las páginas (Dashboard, etc.) */}
      </motion.main>
    </div>
  );
};

export default Layout; 