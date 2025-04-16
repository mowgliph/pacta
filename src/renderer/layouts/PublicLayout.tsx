import React from 'react';
import PublicSidebar from '@/renderer/components/PublicSidebar';
import { Toaster } from '@/renderer/components/ui/toaster';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <PublicSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default PublicLayout;