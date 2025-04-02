import { Router, RootRoute, Route, redirect } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { NotificationProvider } from '@/components/ui/NotificationContainer'
import { AuthProvider } from '@/features/auth/components/AuthProvider'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useStore } from '@/store'

// Importar componentes de página
import { LoginPage } from './features/auth/pages/LoginPage'
import { DashboardPage } from './features/dashboard/pages/DashboardPage'
import { ContractsLayout } from './features/contracts/layouts/ContractsLayout'
import { ContractsListPage } from './features/contracts'
import { ContractCreatePage } from './features/contracts'

// Cliente de consulta para React Query
const queryClient = new QueryClient()

// Componente raíz
const RootComponent = () => (
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

// Crear la ruta raíz
const rootRoute = new RootRoute({
  component: RootComponent
})

// Crear rutas principales
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    // Verificar si el usuario está autenticado
    const isAuthenticated = useStore.getState().isAuthenticated
    const token = useStore.getState().token
    
    // Redirigir según el estado de autenticación
    if (isAuthenticated || token) {
      throw redirect({
        to: '/dashboard',
        replace: true
      })
    } else {
      throw redirect({
        to: '/login',
        replace: true
      })
    }
  }
})

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage
})

const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage
})

// Ruta de contratos con sus hijos
const contractsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/contracts',
  component: ContractsLayout
})

const contractsIndexRoute = new Route({
  getParentRoute: () => contractsRoute,
  path: '/',
  component: ContractsListPage
})

const contractsCreateRoute = new Route({
  getParentRoute: () => contractsRoute,
  path: '/create',
  component: ContractCreatePage
})

// Página 404
const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center p-4">
    <h1 className="text-4xl font-bold">404</h1>
    <p>Página no encontrada</p>
  </div>
)

const notFoundRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: NotFoundPage
})

// Definir árbol de rutas
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  contractsRoute.addChildren([
    contractsIndexRoute,
    contractsCreateRoute
  ]),
  notFoundRoute
])

// Crear el router
export const router = new Router({ 
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
} 