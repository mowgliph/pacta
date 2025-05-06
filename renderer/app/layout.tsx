import "../styles/globals.css";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { ToastProviderCustom } from "@/components/ui/use-toast";
import { ContextMenuProvider } from "@/components/ui/context-menu";

export const metadata = {
  title: "PACTA Dashboard",
  description:
    "Plataforma de Automatización y Control de Contratos Empresariales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                  <main className="flex-1 p-6 bg-[#F5F5F5]">{children}</main>
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
