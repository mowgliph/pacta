import React from 'react';
import { Link } from 'wouter';
import { HoverScale } from '@/renderer/components/ui/micro-interactions';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b" role="banner">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation">
          <div className="flex justify-between h-16">
            <div className="flex">
              <HoverScale>
                <Link href="/">
                  <a className="flex items-center" aria-label="Ir a inicio">
                    <span className="text-2xl font-bold">PACTA</span>
                  </a>
                </Link>
              </HoverScale>
            </div>
            <div className="flex items-center">
              <HoverScale>
                <Link href="/auth">
                  <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                    Iniciar Sesión
                  </a>
                </Link>
              </HoverScale>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {children}
      </main>

      <footer className="border-t" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} PACTA. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout; 