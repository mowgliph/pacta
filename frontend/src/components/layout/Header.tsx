import React, { useState } from 'react';
import { useStore } from '@/store';
import { useNavigate } from '@tanstack/react-router';
import { 
  IconBell, 
  IconMoon, 
  IconSun, 
  IconSearch, 
  IconUserCircle, 
  IconChevronDown 
} from "@tabler/icons-react";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ThemeToggle } from "../ui/ThemeToggle";

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export function Header({ sidebarCollapsed = false }: HeaderProps) {
  const navigate = useNavigate();
  const { logout, user } = useStore(state => ({
    logout: state.logout,
    user: state.user,
  }));

  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    // Aquí iría la lógica real para cambiar el tema
  };

  const handleProfileClick = () => {
    navigate({ to: '/' }); // Dashboard es '/'
  };

  const handleSettingsClick = () => {
    navigate({ to: '/' }); // Dashboard es '/'
  };

  if (!user) return null;

  return (
    <header className={cn(
      "fixed top-0 right-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-4 transition-all duration-300",
      sidebarCollapsed ? "left-16" : "left-64"
    )}>
      <div className="flex items-center gap-2">
        <div className={cn(
          "relative flex items-center rounded-md border border-input bg-background transition-all duration-200",
          searchFocused ? "w-96 ring-2 ring-ring" : "w-64"
        )}>
          <IconSearch className="ml-2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button className="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <IconBell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
        </button>

        <div className="relative">
          <button 
            className="flex items-center gap-2 rounded-full p-1 text-foreground hover:bg-accent transition-colors"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {user.firstName?.charAt(0) || ''}
              {user.lastName?.charAt(0) || ''}
            </div>
            <span className="text-sm">{user.firstName} {user.lastName}</span>
            <IconChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform", 
              userMenuOpen && "rotate-180"
            )} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-border bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent">
                  <IconUserCircle className="h-4 w-4" />
                  Profile
                </a>
                <a href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent">
                  <IconUserCircle className="h-4 w-4" />
                  Settings
                </a>
                <hr className="my-1 border-border" />
                <a href="/logout" className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent">
                  <IconUserCircle className="h-4 w-4" />
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 