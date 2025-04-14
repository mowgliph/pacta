import React from 'react';
import { Link, useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { Button } from '@/renderer/components/ui/button';
import { HoverScale, HoverGlow } from '@/renderer/components/ui/micro-interactions';
import { Notifications } from '@/renderer/components/Notifications';

interface NavigationItem {
  name: string;
  href: string;
}

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logout } = useStore();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Contratos', href: '/contracts' },
    { name: 'Estadísticas', href: '/statistics' },
  ];

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Navegación principal">
          <div className="flex justify-between h-16">
            <div className="flex">
              <HoverScale>
                <Link href="/dashboard">
                  <a className="flex items-center" aria-label="Ir al dashboard">
                    <span className="text-2xl font-bold">PACTA</span>
                  </a>
                </Link>
              </HoverScale>
              <div className="ml-10 flex items-center space-x-4">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <HoverGlow key={item.name}>
                      <Link href={item.href}>
                        <a
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {item.name}
                        </a>
                      </Link>
                    </HoverGlow>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Notifications />
              <HoverScale>
                <Link href="/profile">
                  <a
                    className="text-sm font-medium text-foreground hover:text-accent-foreground"
                    aria-label="Ver perfil"
                  >
                    {user?.email}
                  </a>
                </Link>
              </HoverScale>
              <HoverGlow>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                >
                  Cerrar Sesión
                </Button>
              </HoverGlow>
            </div>
          </div>
        </nav>
      </header>

      <main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" 
        role="main"
        aria-label={location.slice(1).charAt(0).toUpperCase() + location.slice(2)}
      >
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

export default PrivateLayout;