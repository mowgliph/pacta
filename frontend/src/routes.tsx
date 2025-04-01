import { Router, Route as ReactRoute, RootRoute } from '@tanstack/react-router'

// Componentes de rutas
import { RootComponent } from './routes/__root'
import { AuthComponent } from './routes/_auth'
import { AuthenticatedComponent } from './routes/_authenticated'
import { ContractsLayout } from './features/contracts/layouts/ContractsLayout'
import { ContractsListPage } from './features/contracts'
import { ContractCreatePage } from './features/contracts'
import { DashboardPage } from './features/dashboard/pages/DashboardPage'
import { LoginPage } from './features/auth/pages/LoginPage'

// Crear rutas con jerarquía correcta
const rootRoute = new RootRoute({
  component: RootComponent,
})

// Ruta autenticada
const authenticatedRoute = new ReactRoute({
  getParentRoute: () => rootRoute,
  path: '/_authenticated',
  component: AuthenticatedComponent,
})

// Ruta de autenticación
const authRoute = new ReactRoute({
  getParentRoute: () => rootRoute,
  path: '/_auth',
  component: AuthComponent,
})

// Rutas anidadas bajo auth
const loginRoute = new ReactRoute({
  getParentRoute: () => authRoute,
  path: '/login',
  component: LoginPage,
})

// Rutas anidadas bajo authenticated
const dashboardRoute = new ReactRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const contractsRoute = new ReactRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/contracts',
  component: ContractsLayout,
})

const contractsIndexRoute = new ReactRoute({
  getParentRoute: () => contractsRoute,
  path: '/',
  component: ContractsListPage,
})

const contractsCreateRoute = new ReactRoute({
  getParentRoute: () => contractsRoute,
  path: '/create',
  component: ContractCreatePage,
})

// Registrar todas las rutas
export const routeConfig = rootRoute.addChildren([
  authenticatedRoute.addChildren([
    dashboardRoute,
    contractsRoute.addChildren([
      contractsIndexRoute,
      contractsCreateRoute,
    ]),
  ]),
  authRoute.addChildren([
    loginRoute,
  ]),
])

// Crear el router
export const router = new Router({ routeTree: routeConfig })

// Declaración de tipos para React Router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
} 