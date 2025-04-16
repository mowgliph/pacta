import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from "@/renderer/lib/utils";
import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { LogIn, LayoutDashboard, FileText, ChartBar } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const PublicSidebar: React.FC = () => {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { 
      href: '/', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    { 
      href: '/statistics', 
      label: 'Estadísticas', 
      icon: <ChartBar className="h-5 w-5" />
    },
    { 
      href: '/contracts', 
      label: 'Contratos', 
      icon: <FileText className="h-5 w-5" />
    },
    { 
      href: '/auth', 
      label: 'Iniciar Sesión', 
      icon: <LogIn className="h-5 w-5" />
    }
  ];

  return (
    <div className="flex h-full w-[280px] flex-col border-r bg-background">
      <div className="flex h-14 items-center px-4 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-lg font-semibold">PACTA</span>
          <span className="text-sm text-muted-foreground">(Modo Público)</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location === item.href && "bg-accent text-accent-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default PublicSidebar;