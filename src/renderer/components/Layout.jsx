import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from "@/renderer/components/ui/button";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Responsive Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <motion.main 
        className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pt-16 md:pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;