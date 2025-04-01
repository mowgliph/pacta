import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Command as CommandPrimitive } from 'cmdk';
import {
  IconDashboard,
  IconFileDescription,
  IconClipboardList,
  IconBuildingSkyscraper,
  IconUsers,
  IconSettings,
  IconSearch,
  IconArrowRight,
  IconMoon,
  IconSun,
  IconDeviceLaptop,
} from '@tabler/icons-react';

import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useStore } from '@/store';

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

// Componente de lista de comandos
const CommandList = ({
  results,
  onSelect,
}: {
  results: CommandItem[];
  onSelect: (item: CommandItem) => void;
}) => {
  return (
    <CommandPrimitive.List className="max-h-[300px] overflow-y-auto p-2">
      {results.map((item) => (
        <CommandPrimitive.Item
          key={item.id}
          value={item.id}
          onSelect={() => onSelect(item)}
          className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-muted">
              {item.icon}
            </div>
            <span>{item.title}</span>
          </div>
          {item.shortcut && (
            <div className="hidden items-center gap-1 md:flex">
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
        </CommandPrimitive.Item>
      ))}
    </CommandPrimitive.List>
  );
};

// Componente CommandK principal
export function CommandK() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  
  // Store
  const { setTheme, theme, setCommandK } = useStore(state => ({
    setTheme: state.setTheme,
    theme: state.theme,
    setCommandK: state.setCommandK
  }));
  
  // Obtener todos los comandos disponibles
  const commands: CommandItem[] = React.useMemo(() => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <IconDashboard className="h-4 w-4" />,
      href: '/dashboard',
      section: 'principal' as const,
    },
    {
      id: 'contracts',
      title: 'Contratos',
      icon: <IconFileDescription className="h-4 w-4" />,
      href: '/contracts',
      section: 'principal' as const,
    },
    {
      id: 'new-contract',
      title: 'Nuevo Contrato',
      icon: <IconFileDescription className="h-4 w-4" />,
      href: '/contracts/new',
      shortcut: 'N C',
      section: 'principal' as const,
    },
    {
      id: 'supplements',
      title: 'Suplementos',
      icon: <IconClipboardList className="h-4 w-4" />,
      href: '/supplements',
      section: 'principal' as const,
    },
    {
      id: 'new-supplement',
      title: 'Nuevo Suplemento',
      icon: <IconClipboardList className="h-4 w-4" />,
      href: '/supplements/new',
      shortcut: 'N S',
      section: 'principal' as const,
    },
    {
      id: 'companies',
      title: 'Empresas',
      icon: <IconBuildingSkyscraper className="h-4 w-4" />,
      href: '/companies',
      section: 'principal' as const,
    },
    {
      id: 'users',
      title: 'Usuarios',
      icon: <IconUsers className="h-4 w-4" />,
      href: '/users',
      section: 'principal' as const,
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: <IconSettings className="h-4 w-4" />,
      href: '/settings',
      section: 'configuracion' as const,
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      icon: <IconUsers className="h-4 w-4" />,
      href: '/profile',
      section: 'configuracion' as const,
    },
    // Comandos de tema
    {
      id: 'theme-light',
      title: 'Tema Claro',
      icon: <IconSun className="h-4 w-4" />,
      action: () => setTheme('light'),
      section: 'tema' as const,
    },
    {
      id: 'theme-dark',
      title: 'Tema Oscuro',
      icon: <IconMoon className="h-4 w-4" />,
      action: () => setTheme('dark'),
      section: 'tema' as const,
    },
    {
      id: 'theme-system',
      title: 'Tema del Sistema',
      icon: <IconDeviceLaptop className="h-4 w-4" />,
      action: () => {
        // Si se desea implementar un tema de sistema
        console.log('Tema del sistema no implementado aún');
      },
      section: 'tema' as const,
    },
  ], [setTheme]);
  
  // Filtrar resultados por búsqueda
  const filteredResults = React.useMemo(() => {
    if (!search) return commands;
    
    return commands.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, commands]);

  // Separar resultados por sección
  const principalResults = filteredResults.filter((item) => item.section === 'principal');
  const configResults = filteredResults.filter((item) => item.section === 'configuracion');
  const themeResults = filteredResults.filter((item) => item.section === 'tema');
  const otherResults = filteredResults.filter((item) => item.section === 'otros');

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
  const handleSelect = (item: CommandItem) => {
    setOpen(false);
    
    if (item.action) {
      item.action();
      return;
    }
    
    if (item.href) {
      console.log(`Navegando a: ${item.href}`);
      // En el futuro cuando las rutas estén listas:
      // navigate({ to: item.href });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 shadow-2xl max-w-[90vw] md:max-w-[600px]">
        <CommandPrimitive
          className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"
          shouldFilter={false}
        >
          <div className="flex items-center border-b px-3">
            <IconSearch className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
              placeholder="Buscar comandos, páginas, etc..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={search}
              onValueChange={setSearch}
            />
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
              ESC
            </kbd>
          </div>
          <div className="flex flex-col overflow-hidden">
            {principalResults.length > 0 && (
              <div>
                <h2 className="px-2 py-2 text-xs font-medium text-muted-foreground">
                  Principal
                </h2>
                <CommandList results={principalResults} onSelect={handleSelect} />
              </div>
            )}
            
            {configResults.length > 0 && (
              <div>
                <h2 className="px-2 py-2 text-xs font-medium text-muted-foreground">
                  Configuración
                </h2>
                <CommandList results={configResults} onSelect={handleSelect} />
              </div>
            )}
            
            {themeResults.length > 0 && (
              <div>
                <h2 className="px-2 py-2 text-xs font-medium text-muted-foreground">
                  Tema
                </h2>
                <CommandList results={themeResults} onSelect={handleSelect} />
              </div>
            )}
            
            {otherResults.length > 0 && (
              <div>
                <h2 className="px-2 py-2 text-xs font-medium text-muted-foreground">
                  Otros
                </h2>
                <CommandList results={otherResults} onSelect={handleSelect} />
              </div>
            )}
            
            {filteredResults.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <IconSearch className="h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-medium">No se encontraron resultados</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  No hemos encontrado resultados para "{search}". Intenta con otra búsqueda.
                </p>
              </div>
            )}
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
} 