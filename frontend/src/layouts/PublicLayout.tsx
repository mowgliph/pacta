import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout; 