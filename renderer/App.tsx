import { RouterProvider } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProviderCustom } from '@/components/ui/use-toast';
import { router } from '@/routes';

// Componente que envuelve la aplicación con los proveedores necesarios
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProviderCustom>
        <AuthProvider>
          <AnimatePresence mode="wait" initial={false}>
            {children}
          </AnimatePresence>
        </AuthProvider>
      </ToastProviderCustom>
    </ErrorBoundary>
  );
}

// Componente principal exportado
function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
