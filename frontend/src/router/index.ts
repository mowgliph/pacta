import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Definición de tipos para las rutas con extención adecuada para resolver errores de tipado
export interface RouteMeta extends Record<string | number | symbol, unknown> {
  requiresAuth: boolean;
  requiresAdmin?: boolean;
  requiresLicense?: boolean;
  title?: string;
}

// Lazy loading para optimizar la carga
const loadView = (view: string) => {
  return () => import(`@/views/${view}.vue`)
}

// Definición de rutas con mejores prácticas
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DashboardLayout,
    meta: {
      requiresAuth: true,
      requiresLicense: false
    } as RouteMeta,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: loadView('dashboard/DashboardView'),
        meta: {
          requiresAuth: true,
          requiresLicense: false,
          title: 'Panel de Control'
        } as RouteMeta
      },
      {
        path: 'users',
        name: 'users',
        component: loadView('users/UsersView'),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          requiresLicense: true,
          title: 'Gestión de Usuarios'
        } as RouteMeta
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: loadView('analytics/AnalyticsView'),
        meta: {
          requiresAuth: true,
          requiresLicense: false,
          title: 'Analíticas'
        } as RouteMeta
      },
      {
        path: 'contracts',
        name: 'contracts',
        component: loadView('contracts/ContractsView'),
        meta: {
          requiresAuth: true,
          requiresLicense: true,
          title: 'Gestión de Contratos'
        } as RouteMeta
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: loadView('notifications/NotificationsView'),
        meta: {
          requiresAuth: true,
          requiresLicense: false,
          title: 'Notificaciones'
        } as RouteMeta
      },
      {
        path: 'settings',
        name: 'settings',
        component: loadView('settings/SettingsView'),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          requiresLicense: false,
          title: 'Configuración'
        } as RouteMeta
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'login',
        component: loadView('login/LoginView'),
        meta: {
          requiresAuth: false,
          title: 'Iniciar Sesión'
        } as RouteMeta
      },
      {
        path: 'reset-password/:token?',
        name: 'resetPassword',
        component: loadView('login/ResetPasswordView'),
        meta: {
          requiresAuth: false,
          title: 'Restablecer Contraseña'
        } as RouteMeta,
        props: true
      }
    ]
  },
  {
    path: '/license-required',
    name: 'license-required',
    component: loadView('licenses/LicenseRequiredView'),
    meta: {
      requiresAuth: true,
      requiresLicense: false,
      title: 'Licencia Requerida'
    } as RouteMeta
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: loadView('NotFoundView'),
    meta: {
      requiresAuth: false,
      title: 'Página no encontrada'
    } as RouteMeta
  }
]

// Creación del router con configuraciones modernas
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Scroll automático al cambiar de ruta
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Guardia de navegación global
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore()
    
    // Verificar autenticación
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({ 
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // Verificar rol de administrador
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next({ name: 'dashboard' })
      return
    }

    // Verificar licencia activa
    if (to.meta.requiresLicense && !authStore.hasActiveLicense) {
      // Si el usuario está autenticado pero no tiene licencia activa,
      // redirigir a la página de licencia
      if (authStore.isAuthenticated) {
        next({ name: 'license-required' })
      } else {
        next({ 
          name: 'login',
          query: { redirect: to.fullPath }
        })
      }
      return
    }

    // Actualizar título de la página
    document.title = `${to.meta.title || 'PACTA'} - Sistema de Gestión de Contratos`

    // Verificar token expirado
    if (authStore.isAuthenticated && authStore.isTokenExpired) {
      try {
        const refreshed = await authStore.refreshToken()
        if (!refreshed) {
          authStore.logout()
          next({ 
            name: 'login',
            query: { redirect: to.fullPath }
          })
          return
        }
      } catch (error) {
        console.error('Error refreshing token:', error)
        authStore.logout()
        next({ 
          name: 'login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    next({ name: 'login' })
  }
})

// Guardia de navegación después de la ruta
router.afterEach(() => {
  // Limpiar mensajes de error después de la navegación
  const authStore = useAuthStore()
  authStore.clearErrors()
})

export default router
