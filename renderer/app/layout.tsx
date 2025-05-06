import "../styles/globals.css";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { ToastProviderCustom } from "@/components/ui/use-toast";
import { ContextMenuProvider } from "@/components/ui/context-menu";
import { ReactNode, useEffect, useState } from "react";
import { UpdateBanner } from "@/components/ui/UpdateBanner";
import { useRouter } from "next/navigation";

export const metadata = {
  title: "PACTA Dashboard",
  description:
    "Plataforma de Automatización y Control de Contratos Empresariales",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [apiError, setApiError] = useState(false);
  const router = useRouter();

  // Detectar actualización disponible vía IPC
  useEffect(() => {
    // @ts-ignore
    if (window.Electron?.ipcRenderer) {
      // Escuchar evento de actualización
      window.Electron.ipcRenderer.on("app:update-available", () => {
        setUpdateAvailable(true);
      });
    }
    return () => {
      // @ts-ignore
      window.Electron?.ipcRenderer?.removeAllListeners("app:update-available");
    };
  }, []);

  // Manejo global de error de API local
  useEffect(() => {
    const handleApiError = (event: any) => {
      setApiError(true);
      router.push("/_error");
    };
    window.addEventListener("api-error", handleApiError);
    return () => {
      window.removeEventListener("api-error", handleApiError);
    };
  }, [router]);

  const handleRestartApp = () => {
    // @ts-ignore
    window.Electron?.ipcRenderer?.invoke("app:restart");
  };

  return (
    <html lang="es">
      <body className="font-inter bg-[#F5F5F5]">
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
      </body>
    </html>
  );
}
