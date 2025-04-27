"use client"

import { ReactNode } from "react"
import { SidebarNav } from "./sidebar-nav"
import { Header } from "./header"
import { Footer } from "./footer"
import { motion } from "framer-motion"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <SidebarNav />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64 app-background">
        {/* Header */}
        <Header />
        
        {/* Content */}
        <motion.main 
          className="flex-1 px-4 md:px-6 py-4 md:py-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
