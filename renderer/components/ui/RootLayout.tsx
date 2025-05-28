import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorHandler } from "./ErrorHandler";
import { ToastProviderCustom } from "./use-toast";
import { ContextMenuProvider } from "./context-menu";
import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "../../store/theme";
import { UpdateBanner } from "./UpdateBanner";

interface Props {
  children: React.ReactNode;
}

export const ClientRootLayout = ({ children }: Props) => {
  const theme = useThemeStore((state) => state.theme);
  const systemTheme = useThemeStore((state) => state.systemTheme);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Efecto para manejar el tema oscuro/claro
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" || (theme === "system" && systemTheme === "dark");

    root.classList.toggle("dark", isDark);
  }, [theme, systemTheme]);

  // Efecto para manejar actualizaciones disponibles
  useEffect(() => {
    if (!window.electron?.ipcRenderer) {
      console.warn('IPC Renderer no disponible');
      return;
    }
    
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    // Usar ipcRenderer para manejar eventos de actualización
    window.electron.ipcRenderer.on('app:update-available', handleUpdateAvailable);

    return () => {
      // Limpiar el listener cuando el componente se desmonte
      if (window.electron.ipcRenderer.removeListener) {
        window.electron.ipcRenderer.removeListener('app:update-available', handleUpdateAvailable);
      }
    };
  }, []);

  const handleRestartApp = useCallback(async () => {
    try {
      if (!window.electron?.ipcRenderer) {
        throw new Error("IPC Renderer no disponible");
      }

      // Usar ipcRenderer.invoke para llamar al método de reinicio
      await window.electron.ipcRenderer.invoke('app:restart');
    } catch (error) {
      console.error("Error al reiniciar la aplicación:", error);
      const errorEvent = new CustomEvent("api-error", {
        detail: { 
          error: error instanceof Error ? error.message : "No se pudo reiniciar la aplicación",
          type: 'restart-error',
          metadata: {
            timestamp: new Date().toISOString(),
            originalError: error
          }
        }
      });
      window.dispatchEvent(errorEvent);
    }
  }, []);

  return (
    <ErrorHandler>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Sidebar - Siempre visible en escritorio */}
      <div className="w-64 flex-shrink-0 h-screen sticky top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - fixed */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Header />
        </header>

        {/* Main content area with scroll */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <main className="p-6">
              <ErrorBoundary>
                <ToastProviderCustom>
                  <ContextMenuProvider>
                    <UpdateBanner
                      visible={updateAvailable}
                      onRestart={handleRestartApp}
                    />
                    {children}
                  </ContextMenuProvider>
                </ToastProviderCustom>
              </ErrorBoundary>
            </main>
          </div>
          
          {/* Footer - Fixed at bottom */}
          <Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
        </div>
        </div>
      </div>
    </ErrorHandler>
  );
};
