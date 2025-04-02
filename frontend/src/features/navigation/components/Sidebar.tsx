import React from 'react';
import { NavLink } from '@remix-run/react';
import { cn } from '@/lib/utils';
import { 
  IconHome, 
  IconFileText, 
  IconUsers, 
  IconSettings, 
  IconClipboardList, 
  IconBuildingSkyscraper 
} from '@tabler/icons-react';

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      cn("flex items-center py-2 px-4 rounded-md text-sm transition-colors", 
         isActive 
         ? "bg-primary/10 text-primary font-medium" 
         : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )
    }
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r bg-background pt-16 hidden lg:block">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <NavItem to="/" icon={<IconHome size={18} />} label="Inicio" />
            <NavItem to="/contracts" icon={<IconFileText size={18} />} label="Contratos" />
            <NavItem to="/clients" icon={<IconBuildingSkyscraper size={18} />} label="Clientes" />
            <NavItem to="/projects" icon={<IconClipboardList size={18} />} label="Proyectos" />
            <NavItem to="/users" icon={<IconUsers size={18} />} label="Usuarios" />
            <NavItem to="/settings" icon={<IconSettings size={18} />} label="Configuración" />
          </div>
        </div>
      </div>
    </aside>
  );
}; 