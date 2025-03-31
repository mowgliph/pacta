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
  IconChevronLeft,
  IconFileDescription,
  IconBuildingSkyscraper,
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

type SidebarLink = {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
};

const mainLinks: SidebarLink[] = [
  {
    title: "Dashboard",
    icon: <IconDashboard className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    title: "Contracts",
    icon: <IconFileDescription className="h-5 w-5" />,
    href: "/contracts",
    badge: 3,
  },
  {
    title: "Companies",
    icon: <IconBuildingSkyscraper className="h-5 w-5" />,
    href: "/companies",
  },
  {
    title: "Users",
    icon: <IconUsers className="h-5 w-5" />,
    href: "/users",
  },
];

const bottomLinks: SidebarLink[] = [
  {
    title: "Settings",
    icon: <IconSettings className="h-5 w-5" />,
    href: "/settings",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useStore(state => ({ user: state.user }));

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-10 flex h-screen flex-col border-r border-border bg-card text-card-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <h1 className={cn("text-xl font-bold transition-opacity", collapsed ? "opacity-0 w-0" : "opacity-100")}>
          PACTA
        </h1>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 hover:bg-accent text-muted-foreground hover:text-accent-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <IconChevronRight className="h-5 w-5" /> : <IconChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col justify-between p-2">
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {link.icon}
              <span className={cn("transition-opacity", collapsed ? "opacity-0 w-0" : "opacity-100")}>
                {link.title}
              </span>
              {link.badge && !collapsed && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {link.badge}
                </span>
              )}
              {link.badge && collapsed && (
                <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-primary"></span>
              )}
            </a>
          ))}
        </div>

        <div className="space-y-1">
          {bottomLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {link.icon}
              <span className={cn("transition-opacity", collapsed ? "opacity-0 w-0" : "opacity-100")}>
                {link.title}
              </span>
            </a>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2',
            collapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            {user?.firstName?.charAt(0) || ''}
            {user?.lastName?.charAt(0) || ''}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
} 