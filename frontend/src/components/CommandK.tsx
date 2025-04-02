import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  IconDashboard,
  IconFileDescription,
  IconClipboardList,
  IconBuildingSkyscraper,
  IconUsers,
  IconSettings,
  IconMoon,
  IconSun,
  IconDeviceLaptop,
  IconHome,
  IconFileText,
  IconChartLine,
  IconHelpCircle,
  IconBell,
  IconArrowRightDashed
} from '@tabler/icons-react';

import { cn } from '@/lib/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useStore } from '@/store';
import { useThemeStore } from '@/stores/themeStore';
import { ScrollArea } from '@/components/ui/scroll-area';

// Tipo de comando
type CommandItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  shortcut?: string;
  section: 'principal' | 'configuracion' | 'tema' | 'otros';
};

// Componente CommandK principal
export const CommandK = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { setTheme } = useThemeStore();
  
  // Store
  const { setCommandK } = useStore(state => ({
    setCommandK: state.setCommandK
  }));
  
  // Obtener todos los comandos disponibles
  const commands: CommandItem[] = React.useMemo(() => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <IconDashboard className="h-4 w-4" />,
      href: '/_authenticated/dashboard',
      section: 'principal',
    },
    {
      id: 'contracts',
      title: 'Contratos',
      icon: <IconFileDescription className="h-4 w-4" />,
      href: '/_authenticated/contracts',
      section: 'principal',
    },
    {
      id: 'new-contract',
      title: 'Nuevo Contrato',
      icon: <IconFileDescription className="h-4 w-4" />,
      href: '/_authenticated/contracts/create',
      shortcut: 'N C',
      section: 'principal',
    },
    {
      id: 'supplements',
      title: 'Suplementos',
      icon: <IconClipboardList className="h-4 w-4" />,
      href: '/_authenticated/supplements',
      section: 'principal',
    },
    {
      id: 'companies',
      title: 'Empresas',
      icon: <IconBuildingSkyscraper className="h-4 w-4" />,
      href: '/_authenticated/companies',
      section: 'principal',
    },
    {
      id: 'users',
      title: 'Usuarios',
      icon: <IconUsers className="h-4 w-4" />,
      href: '/_authenticated/users',
      section: 'principal',
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: <IconSettings className="h-4 w-4" />,
      href: '/_authenticated/settings',
      section: 'configuracion',
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      icon: <IconUsers className="h-4 w-4" />,
      href: '/_authenticated/profile',
      section: 'configuracion',
    },
    // Comandos de tema
    {
      id: 'theme-light',
      title: 'Tema Claro',
      icon: <IconSun className="h-4 w-4" />,
      action: () => setTheme('light'),
      section: 'tema',
    },
    {
      id: 'theme-dark',
      title: 'Tema Oscuro',
      icon: <IconMoon className="h-4 w-4" />,
      action: () => setTheme('dark'),
      section: 'tema',
    },
    {
      id: 'theme-system',
      title: 'Tema del Sistema',
      icon: <IconDeviceLaptop className="h-4 w-4" />,
      action: () => setTheme('system'),
      section: 'tema',
    },
  ], [setTheme]);
  
  // Registrar funciones en el store
  React.useEffect(() => {
    if (setCommandK) {
      setCommandK({
        toggle: () => setOpen(prev => !prev)
      });
    }
  }, [setCommandK]);

  // Listener para atajo de teclado (Ctrl+K o Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Manejar selección de comando
  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  // Filtrar comandos por sección
  const principalCommands = commands.filter(cmd => cmd.section === 'principal');
  const configCommands = commands.filter(cmd => cmd.section === 'configuracion');
  const themeCommands = commands.filter(cmd => cmd.section === 'tema');

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar comandos, páginas, etc..." />
      <CommandList>
        <ScrollArea className="h-[400px]">
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No se encontraron resultados. Intenta con otra búsqueda.
              </p>
            </div>
          </CommandEmpty>
          
          {principalCommands.length > 0 && (
            <CommandGroup heading="Principal">
              {principalCommands.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => {
                    if (item.action) {
                      runCommand(item.action);
                    } else if (item.href) {
                      runCommand(() => navigate({ to: item.href as any }));
                    }
                  }}
                >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    {item.icon}
                  </div>
                  <span>{item.title}</span>
                  
                  {item.shortcut && (
                    <div className="ml-auto flex items-center gap-1">
                      {item.shortcut.split(' ').map((key) => (
                        <kbd
                          key={key}
                          className="rounded border bg-muted px-1.5 py-0.5 text-xs font-medium"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {configCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Configuración">
                {configCommands.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.title}
                    onSelect={() => {
                      if (item.action) {
                        runCommand(item.action);
                      } else if (item.href) {
                        runCommand(() => navigate({ to: item.href as any }));
                      }
                    }}
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center">
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          
          {themeCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Tema">
                {themeCommands.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.title}
                    onSelect={() => {
                      if (item.action) {
                        runCommand(item.action);
                      }
                    }}
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center">
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}; 