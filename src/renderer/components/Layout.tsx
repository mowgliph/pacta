import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from "@/renderer/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="fixed top-0 left-0 z-40 h-full"
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </motion.div>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className={className}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;