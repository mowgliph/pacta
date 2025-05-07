import "../styles/globals.css";
import { ReactNode } from "react";
import { ClientRootLayout } from "../components/ui/ClientRootLayout";

export const metadata = {
  title: "PACTA Dashboard",
  description:
    "Plataforma de Automatización y Control de Contratos Empresariales",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="font-inter bg-[#F5F5F5]">
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
