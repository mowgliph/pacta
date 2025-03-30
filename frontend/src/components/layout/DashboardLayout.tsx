import React, { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Función para que el Sidebar pueda comunicar su estado de expansión
  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar onToggle={handleSidebarToggle} />
      
      <div 
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarExpanded ? "ml-64" : "ml-16"
        )}
      >
        <Header sidebarExpanded={sidebarExpanded} />
        
        <main 
          className={cn(
            "flex-1 overflow-auto p-6 pt-20 transition-all duration-300"
          )}
        >
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
