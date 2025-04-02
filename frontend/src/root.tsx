import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from './components/theme-provider';
import { NotificationProvider } from './components/ui/NotificationContainer';
import { AuthProvider } from './features/auth/components/AuthProvider';

// Configuración global para SWR
const swrConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0, // No auto-refresco por defecto
  shouldRetryOnError: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
};

export default function App() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="group/body">
        <SWRConfig value={swrConfig}>
          <ThemeProvider>
            <NotificationProvider>
              <AuthProvider>
                <Outlet />
              </AuthProvider>
            </NotificationProvider>
          </ThemeProvider>
        </SWRConfig>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
} 