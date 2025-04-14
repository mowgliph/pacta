import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from "@/renderer/lib/utils";
import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { X } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contracts', label: 'Contratos' },
    { href: '/settings', label: 'Configuración' },
  ];

  return (
    <div className="flex h-full w-[280px] flex-col border-r bg-background">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-lg font-semibold">PACTA</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
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

export default Sidebar;