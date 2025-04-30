"use client"

import { type PropsWithChildren } from "react"
import { motion } from "framer-motion"
import { Navigation } from "./navigation"
import { TooltipProvider } from "../ui/tooltip"

/**
 * Layout principal de la aplicación
 * Gestiona la estructura base de la UI incluyendo sidebar, header y footer
 */
export function MainLayout({ children }: PropsWithChildren) {
  return (
    <TooltipProvider>
      <div className="flex h-screen">
        {/* Barra lateral de navegación */}
        <aside className="w-64 border-r bg-background">
          <Navigation />
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="container py-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </TooltipProvider>
  )
}
