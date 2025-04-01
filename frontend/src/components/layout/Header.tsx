import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useStore } from '@/store';
import { 
  IconBell, 
  IconSearch, 
  IconUser,
  IconSettings,
  IconLogout,
  IconHelpCircle,
  IconCommand,
  IconHexagonLetterP,
  IconMenu2,
  IconLogin
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
import { cn } from '@/lib/utils';
import { ThemeToggle } from "../ui/ThemeToggle";
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface HeaderProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isPublic?: boolean;
}

export function Header({ sidebarCollapsed = false, onToggleSidebar, isPublic = false }: HeaderProps) {
  const navigate = useNavigate();
  const { logout, user, commandK } = useStore(state => ({
    logout: state.logout,
    user: state.user,
    commandK: state.commandK,
  }));

  // Estado para detectar el scroll
  const [scrolled, setScrolled] = useState(false);

  // Efecto para detectar el scroll
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Abrir el CommandK (búsqueda global)
  const openCommandK = () => {
    if (commandK?.toggle) {
      commandK.toggle();
    }
  };

  // Navegar al login
  const handleLogin = () => {
    navigate({ to: '/(auth)/login' });
  };

  // Mock para notificaciones no leídas
  const unreadNotifications = 3;

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-10 flex h-16 items-center justify-between border-b border-border transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background",
        sidebarCollapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex items-center gap-4 px-4">
        {/* Botón de menú para dispositivos móviles */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={onToggleSidebar}
        >
          <IconMenu2 className="h-5 w-5" />
        </Button>
        
        {/* Logo para mobile */}
        <div className="mr-2 md:hidden">
          <IconHexagonLetterP className="h-8 w-8 text-primary" />
        </div>

        <Separator orientation="vertical" className="h-6 hidden md:block" />

        {/* Botón de búsqueda global con atajo de teclado */}
        <Button 
          variant="outline" 
          className="relative h-9 w-9 p-0 xl:h-10 xl:w-64 xl:justify-start xl:px-3 xl:py-2"
          onClick={isPublic ? handleLogin : openCommandK}
        >
          <IconSearch className="h-4 w-4 xl:mr-2" />
          <span className="hidden xl:inline-flex">Buscar...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      <div className="flex items-center gap-3 px-4">
        {/* Botón de login para modo público */}
        {isPublic ? (
          <Button
            size="sm"
            onClick={handleLogin}
            className="flex items-center gap-1"
          >
            <IconLogin className="h-4 w-4" />
            <span className="hidden md:inline">Iniciar Sesión</span>
          </Button>
        ) : (
          <>
            {/* Ayuda */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => console.log('Ayuda')}
              aria-label="Ayuda"
            >
              <IconHelpCircle className="h-5 w-5" />
            </Button>

            {/* Notificaciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <IconBell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <DropdownMenuItem key={i} className="flex flex-col items-start py-2">
                      <div className="font-medium">
                        {i < unreadNotifications ? 'Nueva notificación' : 'Notificación leída'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {[
                          'Contrato próximo a vencer', 
                          'Nuevo usuario registrado', 
                          'Actualización del sistema', 
                          'Nuevo suplemento añadido',
                          'Recordatorio de renovación'
                        ][i]}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Hace {[5, 10, 30, 60, 120][i]} minutos
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center font-medium" onClick={() => console.log('Ver todas las notificaciones')}>
                  Ver todas las notificaciones
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex h-8 items-center gap-2 px-2 hover:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {user?.firstName?.charAt(0) || ''}
                    {user?.lastName?.charAt(0) || ''}
                  </div>
                  <div className="hidden flex-col items-start text-left md:flex">
                    <span className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.role || 'Usuario'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2"
                  onClick={() => console.log('Navegar a perfil')}
                >
                  <IconUser className="h-4 w-4" /> 
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="gap-2"
                  onClick={() => console.log('Navegar a configuración')}
                >
                  <IconSettings className="h-4 w-4" /> 
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 text-destructive focus:text-destructive" 
                  onClick={() => {
                    if (logout) logout();
                    console.log('Cerrar sesión');
                  }}
                >
                  <IconLogout className="h-4 w-4" /> 
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
} 