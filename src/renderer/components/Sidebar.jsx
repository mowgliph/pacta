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
    Eye // Añadir icono Eye
} from 'lucide-react';
import logo from '@/renderer/assets/logo.png'; // Asumiendo que tienes un logo

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

const Sidebar = () => {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const [, navigate] = useLocation(); // Para el logout

  const handleLogout = () => {
    logout(); // Llama a la acción del store (que limpia estado y llama a IPC)
    navigate('/auth', { replace: true }); // Redirige
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-background-card border-r border-border flex flex-col">
      {/* Logo/Header */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-border flex-shrink-0">
        <img src={logo} alt="PACTA Logo" className="h-8 w-auto" />
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <NavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
        <NavLink href="/statistics" icon={BarChart3}>Estadísticas</NavLink>
        {/* <NavLink href="/transactions" icon={ArrowLeftRight}>Transactions</NavLink> Placeholder */}
        {/* <NavLink href="/team" icon={Users}>My Team</NavLink> Placeholder */}
        <NavLink href="/contracts" icon={FileText}>Contratos</NavLink>
        {/* <NavLink href="/settings" icon={Settings}>Settings</NavLink> Placeholder */}
      </nav>

      {/* Sección Usuario/Logout */}
      <div className="px-4 py-4 border-t border-border flex-shrink-0">
        {user && (
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-DEFAULT truncate">{user.username || 'Usuario'}</p>
              <p className="text-xs text-text-secondary truncate">{user.role || 'Rol'}</p>
            </div>
          </div>
        )}
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Button 
                variant="ghost" 
                className="w-full justify-start text-text-secondary hover:bg-gray-100 hover:text-text-DEFAULT"
                onClick={handleLogout}
            >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
            </Button>
        </motion.div>
      </div>
    </aside>
  );
};

export default Sidebar; 