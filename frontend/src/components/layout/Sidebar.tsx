import React, { useState } from 'react';
import { Link, useMatchRoute } from '@tanstack/react-router';
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
  IconX,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  roles?: Role[];
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  expanded,
  roles,
}) => {
  const matchRoute = useMatchRoute();
  const isActive = matchRoute({ to });
  const { hasRole } = useStore(state => ({ hasRole: state.hasRole }));
  
  // Si se especifican roles y el usuario no tiene ninguno, no mostrar el ítem
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return null;
  }

  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
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
          'line-clamp-1 transition-all duration-200',
          expanded ? 'opacity-100' : 'w-0 opacity-0'
        )}
      >
        {label}
      </span>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const { user } = useStore(state => ({ user: state.user }));

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  if (!user) return null;

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out',
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
        >
          {expanded ? (
            <IconChevronRight className="h-4 w-4" />
          ) : (
            <IconMenu2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <NavItem
          to="/dashboard"
          icon={<IconDashboard className="h-4 w-4" />}
          label="Dashboard"
          expanded={expanded}
        />
        <NavItem
          to="/contracts"
          icon={<IconFiles className="h-4 w-4" />}
          label="Contratos"
          expanded={expanded}
          roles={[Role.ADMIN, Role.MANAGER, Role.USER]}
        />
        <NavItem
          to="/users"
          icon={<IconUsers className="h-4 w-4" />}
          label="Usuarios"
          expanded={expanded}
          roles={[Role.ADMIN, Role.RA]}
        />
        <NavItem
          to="/reports"
          icon={<IconReportAnalytics className="h-4 w-4" />}
          label="Reportes"
          expanded={expanded}
          roles={[Role.ADMIN, Role.MANAGER]}
        />
        <NavItem
          to="/settings"
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
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
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