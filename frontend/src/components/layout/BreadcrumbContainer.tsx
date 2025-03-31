import React from 'react';
import { BreadcrumbNavigation } from '../navigation/BreadcrumbNavigation';

export const BreadcrumbContainer: React.FC = () => {
  return (
    <div className="mb-4 animate-in fade-in slide-in-from-top-5 duration-300">
      <BreadcrumbNavigation />
    </div>
  );
}; 