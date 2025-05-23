import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { ThemeToggle } from "./ThemeToggle";
import { ErrorBoundary } from "./ErrorBoundary";
import { ToastProviderCustom } from "./use-toast";
import { ContextMenuProvider } from "./context-menu";
import { ReactNode, useEffect, useState, useCallback } from "react";
import { UpdateBanner } from "./UpdateBanner";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../../store/theme";

interface Props {
  children: ReactNode;
}

type ApiErrorEvent = CustomEvent<{ message?: string }>;

export const ClientRootLayout = ({ children }: Props) => {
  const theme = useThemeStore((state) => state.theme);
  const systemTheme = useThemeStore((state) => state.systemTheme);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" || (theme === "system" && systemTheme === "dark");

    root.classList.toggle("dark", isDark);
  }, [theme, systemTheme]);

  useEffect(() => {
    const electron = window.Electron?.ipcRenderer;
    if (!electron) return;

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    electron.on("app:update-available", handleUpdateAvailable);

    return () => {
      electron.removeListener("app:update-available", handleUpdateAvailable);
    };
  }, []);

  useEffect(() => {
    const handleApiError = (event: ApiErrorEvent) => {
      console.error("API Error:", event.detail?.message);
      navigate("/_error");
    };

    window.addEventListener("api-error", handleApiError as EventListener);
    return () => {
      window.removeEventListener("api-error", handleApiError as EventListener);
    };
  }, [navigate]);

  const handleRestartApp = useCallback(async () => {
    try {
      const electron = window.Electron?.ipcRenderer;
      if (!electron) {
        throw new Error("IPC Renderer no disponible");
      }

      await electron.invoke("app:restart");
    } catch (error) {
      console.error("Error al reiniciar la aplicación:", error);
      const errorEvent = new CustomEvent("api-error", {
        detail: { message: "No se pudo reiniciar la aplicación" },
      });
      window.dispatchEvent(errorEvent);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar - responsive */}
        <div
          className={`
            fixed md:relative w-64 transform transition-transform duration-200 ease-in-out z-30
            ${
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }
          `}
          role="navigation"
          aria-label="Menú principal"
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              {/* Hamburger menu for mobile */}
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Header content */}
              <div className="flex items-center space-x-4">
                <Header />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main
            className="flex-1 p-4 sm:p-6 lg:p-8"
            role="main"
            id="main-content"
          >
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

          <Footer />
        </div>
      </div>
    </div>
  );
};
