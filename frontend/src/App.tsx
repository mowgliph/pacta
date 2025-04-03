import { Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { privateRoutes, publicRoutes } from './routes';
import { AuthProvider } from './features/auth/components/AuthProvider';
import { Spinner } from './components/ui/spinner';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { queryClient } from './lib/react-query';

// Componente para renderizar las rutas
const AppRoutes = () => {
  const routes = useRoutes([...publicRoutes, ...privateRoutes]);
  return routes;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="pacta-theme">
        <BrowserRouter>
          <AuthProvider>
            <Suspense 
              fallback={
                <div className="flex h-screen items-center justify-center">
                  <Spinner size="lg" />
                </div>
              }
            >
              <AppRoutes />
              <Toaster />
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App; 