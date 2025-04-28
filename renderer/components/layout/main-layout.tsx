"use client"

import { ReactNode, useEffect } from "react"
import { SidebarNav } from "./sidebar-nav"
import { Header } from "./header"
import { Footer } from "./footer"
import { motion } from "framer-motion"
import { useUIStore } from "../../store/useUIStore"
import { useNotificationStore } from "../../store/useNotificationStore"

interface MainLayoutProps {
  children: ReactNode
}

/**
 * Layout principal de la aplicación
 * Gestiona la estructura base de la UI incluyendo sidebar, header y footer
 */
export function MainLayout({ children }: MainLayoutProps) {
  // Obtener estado del sidebar desde el store
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  
  // Cargar notificaciones al montar el componente
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  
  useEffect(() => {
    // Cargar notificaciones al inicio
    fetchNotifications().catch(console.error);
    
    // Detectar tamaño de pantalla para autoajustar el sidebar
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // Configuración inicial
    handleResize();
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    
    // Limpiar listener
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchNotifications, setSidebarOpen]);
  
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar con state desde el store */}
      <SidebarNav open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      {/* Main content con ajuste basado en el estado del sidebar */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        {/* Header */}
        <Header />
        
        {/* Content con animación */}
        <motion.main 
          className="flex-1 px-4 md:px-6 py-4 md:py-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
