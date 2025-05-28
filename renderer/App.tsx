import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClientRootLayout } from "./components/ui/RootLayout";
import { useThemeStore } from "./store/theme";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProviderCustom } from "./components/ui/use-toast";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import Dashboard from "./app/dashboard/page";
import Login from "./app/login/page";
import Users from "./app/admin/users/page";
import Settings from "./app/admin/settings/page";
import Statistics from "./app/statistics/page";
import Contracts from "./app/contracts/page";
import NotFound from "./app/not-found/page";

// Componente que envuelve la aplicación con los proveedores necesarios
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <ToastProviderCustom>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProviderCustom>
    </BrowserRouter>
  );
}

// Componente principal de la aplicación
function AppContent() {
  const initTheme = useThemeStore((state) => state.init);

  useEffect(() => {
    initTheme().catch(console.error);
  }, [initTheme]);

  return (
    <ClientRootLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/contracts" element={<Contracts />} />
        
        {/* Ruta para errores 404 */}
        <Route 
          path="*" 
          element={
            <ErrorBoundary>
              <NotFound />
            </ErrorBoundary>
          } 
        />
      </Routes>
    </ClientRootLayout>
  );
}

// Componente principal exportado
const App = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;
