import React from 'react';
import { useStore } from '@/store';
import { useNavigate } from '@tanstack/react-router';
import { IconBell, IconMoon, IconSun, IconSearch } from '@tabler/icons-react';
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

interface HeaderProps {
  sidebarExpanded: boolean;
}

export const Header: React.FC<HeaderProps> = ({ sidebarExpanded }) => {
  const navigate = useNavigate();
  const { logout, user } = useStore(state => ({
    logout: state.logout,
    user: state.user,
  }));

  // Para el cambio de tema, mejorar esto después con un slice de UI
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    // Aquí iría la lógica real para cambiar el tema
  };

  // Funciones para manejar la navegación
  const handleProfileClick = () => {
    // Por ahora navegamos al dashboard, en el futuro cuando exista la ruta /profile
    navigate({ to: '/' }); // Dashboard es '/'
  };

  const handleSettingsClick = () => {
    // Por ahora navegamos al dashboard, en el futuro cuando exista la ruta /settings
    navigate({ to: '/' }); // Dashboard es '/'
  };

  if (!user) return null;

  return (
    <header
      className={cn(
        'fixed z-10 flex h-16 w-full items-center justify-between border-b bg-background px-4 transition-all duration-300',
        sidebarExpanded ? 'pl-64' : 'pl-16'
      )}
    >
      <div className="flex items-center gap-4 md:gap-8">
        <div className="relative w-64 max-w-sm hidden sm:block">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-8 h-9 bg-muted/50 border-muted-foreground/20 focus-visible:bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <IconBell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            3
          </span>
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? (
            <IconMoon className="h-5 w-5" />
          ) : (
            <IconSun className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {user.firstName?.charAt(0) || ''}
                {user.lastName?.charAt(0) || ''}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}; 