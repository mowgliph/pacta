import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";
import { ToastProviderCustom } from "./use-toast";
import { ContextMenuProvider } from "./context-menu";
import { ReactNode, useEffect, useState, useCallback } from "react";
import { UpdateBanner } from "./UpdateBanner";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

type ApiErrorEvent = CustomEvent<{ message?: string }>;

export const ClientRootLayout = ({ children }: Props) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const navigate = useNavigate();

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
    <ContextMenuProvider>
      <ToastProviderCustom>
        <div className="relative min-h-screen">
          {/* Sidebar fijo a la izquierda */}
          <div className="fixed left-0 top-0 h-screen z-10">
            <Sidebar />
          </div>
          <div className="ml-64 flex flex-col min-h-screen">
            {/* Header fijo en la parte superior */}
            <div className="fixed top-0 right-0 left-64 z-10">
              <Header />
            </div>
            {/* Espacio para el header */}
            <div className="h-16"></div>
            <ErrorBoundary>
              {/* Contenido principal con scroll */}
              <main className="flex-1 p-6 pb-20 bg-[#F5F5F5] overflow-y-auto min-h-[calc(100vh-112px)]">
                <UpdateBanner
                  visible={updateAvailable}
                  onRestart={handleRestartApp}
                />
                {children}
              </main>
            </ErrorBoundary>
            {/* Footer fijo en la parte inferior */}
            <div className="fixed bottom-0 right-0 left-64 z-10">
              <Footer />
            </div>
          </div>
        </div>
      </ToastProviderCustom>
    </ContextMenuProvider>
  );
};
