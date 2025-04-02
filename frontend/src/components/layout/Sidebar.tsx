import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from '@remix-run/react';
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
  IconClipboardList,
  IconCalendarEvent,
  IconBell,
  IconLogout,
  IconCommand,
  IconInfoCircle,
  IconLogin,
  IconPlus
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Tipos para los enlaces de navegación
type NavLink = {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  roles?: Role[];
  isPublicOnly?: boolean;
  action?: () => void;
};

// Tipo para una sección de navegación
type NavSection = {
  title?: string;
  links: NavLink[];
  isPublicOnly?: boolean;
};

// Props para el NavItem
type NavItemProps = {
  link: NavLink;
  collapsed: boolean;
  isPublic?: boolean;
  onRequireAuth?: () => void;
}

// Componente para cada enlace de navegación
const NavItem = ({ link, collapsed, isPublic, onRequireAuth }: NavItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === link.href;
  const { hasRole } = useStore(state => ({ hasRole: state.hasRole }));
  
  // Verificar si el usuario tiene permiso para acceder a la ruta
  const hasPermission = !link.roles || hasRole(link.roles);
  
  // Si es ruta pública, verificar si es solo para público
  if (isPublic && !link.isPublicOnly) {
    return null;
  }
  
  // Si requiere autenticación y el usuario no tiene permiso, no mostrar el enlace
  if (!isPublic && !hasPermission) {
    return null;
  }
  
  // Función para manejar clic en enlaces
  const handleClick = () => {
    if (link.action) {
      link.action();
    } else {
      navigate(link.href);
    }
  };

  const navItem = (
    <button
      onClick={handleClick}
      className={cn(
        'group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-5 w-5 items-center justify-center shrink-0">
          {link.icon}
        </span>
        <span
          className={cn(
            'line-clamp-1 text-left transition-all duration-200',
            collapsed ? 'w-0 opacity-0' : 'opacity-100'
          )}
        >
          {link.title}
        </span>
      </div>
      
      {link.badge && !collapsed && (
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
          {link.badge}
        </span>
      )}
      
      {link.badge && collapsed && (
        <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-primary"></span>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{navItem}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {link.title}
            {link.badge && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {link.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return navItem;
};

// Secciones de navegación privadas
const navSections: NavSection[] = [
  {
    links: [
      {
        title: "Dashboard",
        icon: <IconDashboard className="h-5 w-5" />,
        href: "/dashboard",
      },
    ]
  },
  {
    title: "Contratos",
    links: [
      {
        title: "Todos los contratos",
        icon: <IconFileDescription className="h-5 w-5" />,
        href: "/contracts",
      },
      {
        title: "Crear contrato",
        icon: <IconPlus className="h-5 w-5" />,
        href: "/contracts/create",
        roles: [Role.ADMIN, Role.MANAGER],
      },
    ]
  },
  {
    title: "Gestión",
    links: [
      {
        title: "Suplementos",
        icon: <IconClipboardList className="h-5 w-5" />,
        href: "/supplements",
      },
      {
        title: "Empresas",
        icon: <IconBuildingSkyscraper className="h-5 w-5" />,
        href: "/companies",
      },
    ]
  },
  {
    title: "Administración",
    links: [
      {
        title: "Usuarios",
        icon: <IconUsers className="h-5 w-5" />,
        href: "/users",
        roles: [Role.ADMIN],
      },
      {
        title: "Notificaciones",
        icon: <IconBell className="h-5 w-5" />,
        href: "/notifications",
        badge: 5,
      },
    ]
  },
  {
    title: "Sistema",
    links: [
      {
        title: "Estadísticas",
        icon: <IconReportAnalytics className="h-5 w-5" />,
        href: "/statistics",
      },
      {
        title: "Configuración",
        icon: <IconSettings className="h-5 w-5" />,
        href: "/settings",
      },
    ]
  }
];

// Secciones de navegación públicas
const publicNavSections: NavSection[] = [
  {
    links: [
      {
        title: "Panel principal",
        icon: <IconDashboard className="h-5 w-5" />,
        href: "/",
        isPublicOnly: true,
      },
    ]
  },
  {
    title: "Acceso",
    links: [
      {
        title: "Iniciar sesión",
        icon: <IconLogin className="h-5 w-5" />,
        href: "/login",
        isPublicOnly: true,
      },
      {
        title: "Acerca de PACTA",
        icon: <IconInfoCircle className="h-5 w-5" />,
        href: "/about",
        isPublicOnly: true,
      }
    ]
  }
];

export function Sidebar({ isPublic = false }: { isPublic?: boolean }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useStore(state => ({ 
    user: state.user,
    logout: state.logout
  }));
  const commandK = useStore(state => state.commandK);

  // Efecto para escuchar el atajo de teclado para colapsar/expandir sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Abrir el CommandK (búsqueda global)
  const handleCommandK = () => {
    if (commandK?.toggle) {
      commandK.toggle();
    }
  };
  
  // Redirigir al login cuando se requiera autenticación
  const handleRequireAuth = () => {
    navigate('/login');
  };

  // Cerrar sesión
  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/');
    }
  };

  // Determinar qué secciones de navegación mostrar
  const sectionsToShow = isPublic ? publicNavSections : navSections;

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-20 flex h-screen flex-col border-r border-border bg-card text-card-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <h1 className={cn("text-xl font-bold transition-opacity flex items-center gap-2", 
          collapsed ? "opacity-0 w-0" : "opacity-100"
        )}>
          <span className="text-primary">P</span>ACTA
        </h1>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 hover:bg-accent text-muted-foreground hover:text-accent-foreground"
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          title={`${collapsed ? "Expandir" : "Contraer"} (Ctrl+B)`}
        >
          {collapsed ? <IconChevronRight className="h-5 w-5" /> : <IconChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {sectionsToShow.map((section, idx) => (
          <div key={idx} className="py-2">
            {section.title && !collapsed && (
              <h2 className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                {section.title}
              </h2>
            )}
            {section.title && collapsed && idx > 0 && (
              <Separator className="mx-auto my-2 w-4/5" />
            )}
            <div className="space-y-1">
              {section.links.map((link, linkIdx) => (
                <NavItem 
                  key={linkIdx} 
                  link={link} 
                  collapsed={collapsed} 
                  isPublic={isPublic}
                  onRequireAuth={handleRequireAuth}
                />
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>

      {!isPublic ? (
        <div className="mt-auto border-t border-border p-3 space-y-2">
          <Button
            variant="outline" 
            className={cn(
              "w-full text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center gap-2",
              collapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={handleCommandK}
          >
            <IconCommand className="h-5 w-5" />
            {!collapsed && <span>Búsqueda global</span>}
            {!collapsed && (
              <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
                Ctrl+K
              </kbd>
            )}
          </Button>

          <div
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/50 cursor-pointer transition-colors',
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
                  {user?.role || 'Usuario'}
                </p>
              </div>
            )}
          </div>

          <Button
            variant="ghost" 
            className={cn(
              "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center gap-2",
              collapsed ? "justify-center" : "justify-start"
            )}
            onClick={handleLogout}
          >
            <IconLogout className="h-5 w-5" />
            {!collapsed && <span>Cerrar sesión</span>}
          </Button>
        </div>
      ) : (
        <div className="mt-auto border-t border-border p-3">
          <Button
            className={cn(
              "w-full flex items-center gap-2",
              collapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={handleRequireAuth}
          >
            <IconLogin className="h-5 w-5" />
            {!collapsed && <span>Iniciar Sesión</span>}
          </Button>
        </div>
      )}
    </aside>
  );
} 