import React, { useState } from 'react';
import { useNavigate, useMatchRoute } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';
import { Role } from '@/types/enums';
import {
  IconDashboard,
  IconFiles,
  IconUsers,
  IconSettings,
  IconReportAnalytics,
  IconChevronRight,
  IconMenu2,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  roles?: Role[];
}

interface SidebarProps {
  onToggle: (expanded: boolean) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  expanded,
  roles,
}) => {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const isActive = matchRoute({ to });
  const { hasRole } = useStore(state => ({ hasRole: state.hasRole }));
  
  // Si se especifican roles y el usuario no tiene ninguno, no mostrar el ítem
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return null;
  }
  
  // Usar onClick en lugar de Link para evitar problemas con rutas no definidas
  const handleClick = () => {
    navigate({ to });
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {icon}
      </span>
      <span
        className={cn(
          'line-clamp-1 text-left transition-all duration-200',
          expanded ? 'opacity-100' : 'w-0 opacity-0'
        )}
      >
        {label}
      </span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const [expanded, setExpanded] = useState(true);
  const { user } = useStore(state => ({ user: state.user }));

  const toggleSidebar = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    onToggle(newExpandedState);
  };

  if (!user) return null;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-20 flex h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out',
        expanded ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className={cn('flex items-center gap-2 transition-all', expanded ? 'opacity-100' : 'opacity-0')}>
          <span className="font-bold text-primary">PACTA</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
          aria-label={expanded ? "Contraer menú" : "Expandir menú"}
        >
          {expanded ? (
            <IconChevronRight className="h-4 w-4" />
          ) : (
            <IconMenu2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavItem
          to="/"
          icon={<IconDashboard className="h-4 w-4" />}
          label="Dashboard"
          expanded={expanded}
        />
        {/* Solo mostrar estos elementos si tienen rutas implementadas */}
        {/* Por ahora todos dirigen al dashboard */}
        <NavItem
          to="/"
          icon={<IconFiles className="h-4 w-4" />}
          label="Contratos"
          expanded={expanded}
          roles={[Role.ADMIN, Role.MANAGER, Role.USER]}
        />
        <NavItem
          to="/"
          icon={<IconUsers className="h-4 w-4" />}
          label="Usuarios"
          expanded={expanded}
          roles={[Role.ADMIN, Role.RA]}
        />
        <NavItem
          to="/"
          icon={<IconReportAnalytics className="h-4 w-4" />}
          label="Reportes"
          expanded={expanded}
          roles={[Role.ADMIN, Role.MANAGER]}
        />
        <NavItem
          to="/"
          icon={<IconSettings className="h-4 w-4" />}
          label="Configuración"
          expanded={expanded}
          roles={[Role.ADMIN, Role.RA]}
        />
      </nav>

      <div className="mt-auto border-t p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2',
            expanded ? 'justify-start' : 'justify-center'
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            {user.firstName?.charAt(0) || ''}
            {user.lastName?.charAt(0) || ''}
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}; 