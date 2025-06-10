import Sidebar from "./Sidebar";
import Header from "./Header";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { ErrorHandler } from "../ui/ErrorHandler";
import { ToastProviderCustom } from "../ui/use-toast";
import { ContextMenuProvider } from "../ui/context-menu";
import { useCallback, useEffect, useState } from "react";
import { UpdateBanner } from "../ui/UpdateBanner";
import { useCommandMenu } from "../ui/use-command-menu";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../ui/command-menu";
import type { CommandMenuGroup } from "../ui/command-menu";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const commandMenu = useCommandMenu();

  const menuItems: CommandMenuGroup[] = [
    {
      label: "Navegación",
      items: [
        {
          label: "Ir a inicio",
          shortcut: ["⌘+1"],
          action: () => (window.location.href = "#/"),
        },
        {
          label: "Ir a contratos",
          shortcut: ["⌘+2"],
          action: () => (window.location.href = "#/contracts"),
        },
        {
          label: "Ir a dashboard",
          shortcut: ["⌘+3"],
          action: () => (window.location.href = "#/dashboard"),
        },
      ],
    },
    {
      label: "Acciones rápidas",
      items: [
        {
          label: "Crear nuevo contrato",
          shortcut: ["⌘+N"],
          action: () => {
            window.electron.ipcRenderer.invoke("contracts:create-new");
          },
        },
        {
          label: "Buscar contrato",
          shortcut: ["⌘+F"],
          action: () => {
            window.electron.ipcRenderer.invoke("contracts:search");
          },
        },
        {
          label: "Ver estadísticas",
          shortcut: ["⌘+S"],
          action: () => (window.location.href = "#/statistics"),
        },
      ],
    },
  ];

  // Efecto para manejar actualizaciones disponibles
  useEffect(() => {
    if (!window.electron?.ipcRenderer) {
      console.warn("IPC Renderer no disponible");
      return;
    }

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    // Usar ipcRenderer para manejar eventos de actualización
    window.electron.ipcRenderer.on(
      "app:update-available",
      handleUpdateAvailable
    );

    return () => {
      // Limpiar el listener cuando el componente se desmonte
      if (window.electron.ipcRenderer.removeListener) {
        window.electron.ipcRenderer.removeListener(
          "app:update-available",
          handleUpdateAvailable
        );
      }
    };
  }, []);

  const handleRestartApp = useCallback(async () => {
    try {
      if (!window.electron?.ipcRenderer) {
        throw new Error("IPC Renderer no disponible");
      }

      // Usar ipcRenderer.invoke para llamar al método de reinicio
      await window.electron.ipcRenderer.invoke("app:restart");
    } catch (error) {
      console.error("Error al reiniciar la aplicación:", error);
      const errorEvent = new CustomEvent("api-error", {
        detail: {
          error:
            error instanceof Error
              ? error.message
              : "No se pudo reiniciar la aplicación",
          type: "restart-error",
          metadata: {
            timestamp: new Date().toISOString(),
            originalError: error,
          },
        },
      });
      window.dispatchEvent(errorEvent);
    }
  }, []);

  return (
    <ErrorHandler>
      <ErrorBoundary>
        <ToastProviderCustom>
          <ContextMenuProvider>
            <div className="h-screen bg-gray-50 flex overflow-hidden">
              {/* Sidebar - Siempre visible en escritorio */}
              <div className="w-64 flex-shrink-0 h-full bg-white border-r border-gray-200">
                <Sidebar />
              </div>

              {/* Main content area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <CommandDialog>
                  <div className="flex flex-col h-full">
                    <CommandInput
                      placeholder="Buscar acciones..."
                      value={commandMenu.query}
                      onValueChange={commandMenu.setQuery}
                      onKeyDown={(e: React.KeyboardEvent) =>
                        commandMenu.handleKeyDown(e, menuItems)
                      }
                    />
                    <CommandList>
                      {menuItems.map((group, groupIndex) => (
                        <CommandGroup key={group.label}>
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                            {group.label}
                          </div>
                          {commandMenu
                            .filterItems(group.items, commandMenu.query)
                            .map((item, itemIndex) => (
                              <CommandItem
                                key={item.label}
                                value={item.label}
                                onSelect={item.action}
                                disabled={item.disabled}
                              >
                                {item.label}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                    {commandMenu.query && (
                      <CommandEmpty>
                        No se encontraron acciones que coincidan con "
                        {commandMenu.query}"
                      </CommandEmpty>
                    )}
                  </div>
                </CommandDialog>
                <div className="flex-shrink-0">
                  <Header />
                </div>
                <div className="flex-1 overflow-y-auto">
                  <main className="p-6">
                    {children}
                  </main>
                </div>
                {updateAvailable && (
                  <UpdateBanner
                    visible={updateAvailable}
                    onRestart={handleRestartApp}
                  />
                )}
              </div>
            </div>
          </ContextMenuProvider>
        </ToastProviderCustom>
      </ErrorBoundary>
    </ErrorHandler>
  );
};
