// Archivo generado para el enrutador TanStack
// Este archivo simula la generación de rutas a partir de la estructura de archivos

import { 
  createRootRoute, 
  createRoute, 
  createRouter 
} from '@tanstack/react-router'

import { RootComponent } from './routes/__root'
import { DashboardComponent } from './routes/dashboard'
import { AuthenticatedComponent, authenticatedLoader } from './routes/_authenticated'
import { AuthenticatedIndexComponent } from './routes/_authenticated/index'
import { ContractsComponent } from './routes/_authenticated/contracts'
import { UsersComponent } from './routes/_authenticated/users'
import { LoginComponent, loginLoader } from './routes/(auth)/login'
import { NotFoundComponent } from './routes/(errors)/404'

// Definición de rutas con sus respectivos componentes
const rootRoute = createRootRoute({
  component: RootComponent,
})

// Ruta principal - muestra el dashboard sin autenticación
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardComponent,
})

// Rutas autenticadas - requieren inicio de sesión
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/_authenticated',
  component: AuthenticatedComponent,
  beforeLoad: authenticatedLoader,
})

const authenticatedIndexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: AuthenticatedIndexComponent,
})

const contractsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/contracts',
  component: ContractsComponent,
})

const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/users',
  component: UsersComponent,
})

// Ruta de login
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/(auth)/login',
  component: LoginComponent,
  beforeLoad: loginLoader,
})

// Ruta 404
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/(errors)/404',
  component: NotFoundComponent,
})

// Estructura del árbol de rutas
export const routeTree = rootRoute.addChildren([
  indexRoute,
  authenticatedRoute.addChildren([
    authenticatedIndexRoute,
    contractsRoute,
    usersRoute,
  ]),
  loginRoute,
  notFoundRoute,
])

// Crear el router con el árbol de rutas
export const router = createRouter({ routeTree }) 