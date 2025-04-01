import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@/components/theme-provider'
import { NotificationProvider } from '@/components/ui/NotificationContainer'
import { AuthProvider } from '@/features/auth/components/AuthProvider'

// Componente para errores generales
function GeneralError() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Algo salió mal</h1>
      <p className="text-muted-foreground">
        Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
      </p>
    </div>
  )
}

// Componente para página no encontrada
function NotFoundError() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="text-muted-foreground">
        La página que estás buscando no existe.
      </p>
    </div>
  )
}

// Cliente de consulta para React Query
const queryClient = new QueryClient()

// Componente raíz que proporciona contexto a toda la aplicación
export function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}