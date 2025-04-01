import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { CommandK } from "../CommandK";
import { useStore } from "@/store";

type DashboardLayoutProps = {
  children: React.ReactNode;
  isPublic?: boolean;
};

export function DashboardLayout({ children, isPublic = false }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Establece el estado de CommandK en el store
  const setCommandK = useStore(state => state.setCommandK);
  const commandKRef = useStore(state => state.commandK);

  // Manejar el colapso/expansión del sidebar
  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Registra la referencia a CommandK en el store si no existe
  useEffect(() => {
    if (mounted && !commandKRef && setCommandK) {
      const commandKInstance = {
        toggle: () => {
          // Esta función será sobreescrita por el componente CommandK
          console.log("CommandK toggle placeholder");
        }
      };
      setCommandK(commandKInstance);
    }
  }, [mounted, commandKRef, setCommandK]);

  return (
    <div className="min-h-screen bg-background relative">
      <Sidebar isPublic={isPublic} />
      
      <Header 
        sidebarCollapsed={sidebarCollapsed} 
        onToggleSidebar={handleToggleSidebar} 
        isPublic={isPublic}
      />
      
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
      
      {/* Búsqueda global (CommandK) */}
      <CommandK />
    </div>
  );
}
