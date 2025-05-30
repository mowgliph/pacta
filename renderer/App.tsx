import { RouterProvider } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { router } from '@/routes';

// Componente que envuelve la aplicación con los proveedores necesarios
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

// Componente principal de la aplicación
function AppContent() {
  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait" initial={false}>
        <RouterProvider router={router} />
      </AnimatePresence>
    </ErrorBoundary>
  );
}

// Componente principal exportado
function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
