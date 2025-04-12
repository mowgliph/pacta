import React from 'react';
import { Link, useLocation } from 'wouter'; // Para enlaces y detectar ruta activa
import useStore from '@/renderer/store/useStore'; // Para obtener user y logout
import { Button } from "@/renderer/components/ui/button";
import { motion } from 'framer-motion'; // Importar motion
import { 
    LayoutDashboard, // Dashboard
    BarChart3, // Statistics
    ArrowLeftRight, // Transaction (Placeholder)
    Users, // My Team (Placeholder)
    FileText, // Sell Reports / Contracts
    Settings, // Settings
    LogOut, // Log Out
    Eye, // Añadir icono Eye
    X
} from 'lucide-react';
import logo from '@/renderer/assets/logo.png'; // Asumiendo que tienes un logo
import Notifications from './Notifications';

// Helper para clases de enlaces activos
const NavLink = ({ href, children, icon: Icon }) => {
  const [isActive] = useLocation(href);
  return (
    <Link href={href}>
      <motion.a 
        className={(
          `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out cursor-pointer ` +
          (isActive 
            ? 'bg-brand-light text-brand-dark'
            : 'text-text-secondary hover:bg-gray-100 hover:text-text-DEFAULT'
          )
        )}
        whileHover={{ x: 3 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {Icon && <Icon className="mr-3 h-5 w-5 flex-shrink-0" />}
        <span>{children}</span>
      </motion.a>
    </Link>
  );
};

const Sidebar = ({ onClose }) => {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const [, navigate] = useLocation();

  const handleNavigation = (path) => {
    if (onClose) onClose();
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside className="w-[280px] md:w-64 h-full flex-shrink-0 bg-background-card border-r border-border flex flex-col">
      {/* Logo/Header with responsive sizing */}
      <div className="h-16 md:h-14 flex items-center justify-between px-4 border-b border-border">
        <img src={logo} alt="PACTA Logo" className="h-8 md:h-6 w-auto" />
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable navigation with improved spacing */}
      <nav className="flex-1 px-2 py-2 md:py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                w-full flex items-center px-3 py-2 rounded-md text-sm
                transition-colors duration-150 ease-in-out
                ${location === item.path 
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent'}
              `}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Notifications */}
      <div className="border-t border-border p-4">
        <Notifications />
      </div>

      {/* User section with responsive padding */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-muted-foreground text-xs">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;