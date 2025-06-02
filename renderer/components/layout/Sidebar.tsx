import React from 'react';
import {
  IconFileText,
  IconSettings,
  IconLogout,
  IconLayoutDashboard,
  IconChartBar,
  IconUser,
  IconChevronRight
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { cn } from '../../lib/utils';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarProps {
  onClose?: () => void;
}

const menu: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <IconLayoutDashboard className="h-5 w-5" />,
    href: '/dashboard',
  },
  {
    label: 'Estadísticas',
    icon: <IconChartBar className="h-5 w-5" />,
    href: '/statistics',
  },
  {
    label: 'Contratos',
    icon: <IconFileText className="h-5 w-5" />,
    href: '/contracts',
  },
  {
    label: 'Usuarios',
    icon: <IconUser className="h-5 w-5" />,
    href: '/admin/users',
  },
];

const Sidebar = ({ onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo y botón de cierre */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-2">
            <IconFileText className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">PACTA</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            aria-label="Cerrar menú"
          >
            <IconChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => (
          <div
            key={item.href}
            onClick={() => {
              navigate(item.href);
              onClose?.();
            }}
            className={cn(
              'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer',
              isActive(item.href)
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <span className="mr-3">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Perfil de usuario */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {user?.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Cerrar sesión"
          >
            <IconLogout className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
