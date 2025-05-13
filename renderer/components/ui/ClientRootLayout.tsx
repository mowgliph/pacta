import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";
import { ToastProviderCustom } from "./use-toast";
import { ContextMenuProvider } from "./context-menu";
import { ReactNode, useEffect, useState } from "react";
import { UpdateBanner } from "./UpdateBanner";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export const ClientRootLayout = ({ children }: Props) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // @ts-ignore
    if (window.Electron?.ipcRenderer) {
      window.Electron.ipcRenderer.on("app:update-available", () => {
        setUpdateAvailable(true);
      });
    }
    return () => {
      // @ts-ignore
      window.Electron?.ipcRenderer?.removeAllListeners("app:update-available");
    };
  }, []);

  useEffect(() => {
    const handleApiError = () => {
      navigate("/_error");
    };
    window.addEventListener("api-error", handleApiError);
    return () => {
      window.removeEventListener("api-error", handleApiError);
    };
  }, [navigate]);

  const handleRestartApp = () => {
    // @ts-ignore
    window.Electron?.ipcRenderer?.invoke("app:restart");
  };

  return (
    <ContextMenuProvider>
      <ToastProviderCustom>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            <ErrorBoundary>
              <main className="flex-1 p-6 bg-[#F5F5F5]">
                <UpdateBanner
                  visible={updateAvailable}
                  onRestart={handleRestartApp}
                />
                {children}
              </main>
            </ErrorBoundary>
            <Footer />
          </div>
        </div>
      </ToastProviderCustom>
    </ContextMenuProvider>
  );
};
