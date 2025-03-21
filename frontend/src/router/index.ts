import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Definición de tipos para las rutas
type RouteMeta = {
  requiresAuth: boolean;
  requiresAdmin?: boolean;
  requiresLicense?: boolean;
  title?: string;
} & Record<string | number | symbol, unknown>

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
          component: () => import('@/views/DashboardView.vue'),
          meta: {
            requiresAuth: true,
            requiresLicense: false,
            title: 'Panel de Control'
          } as RouteMeta
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/users/UsersView.vue'),
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
          component: () => import('@/views/AnalyticsView.vue'),
          meta: {
            requiresAuth: true,
            requiresLicense: false,
            title: 'Analíticas'
          } as RouteMeta
        },
        {
          path: 'contracts',
          name: 'contracts',
          component: () => import('@/views/contracts/ContractsView.vue'),
          meta: {
            requiresAuth: true,
            requiresLicense: true,
            title: 'Gestión de Contratos'
          } as RouteMeta
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
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
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        requiresAuth: false,
        title: 'Iniciar Sesión'
      } as RouteMeta
    },
    {
      path: '/license-required',
      name: 'license-required',
      component: () => import('@/views/LicenseRequiredView.vue'),
      meta: {
        requiresAuth: true,
        requiresLicense: false,
        title: 'Licencia Requerida'
      } as RouteMeta
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        requiresAuth: false,
        title: 'Página no encontrada'
      } as RouteMeta
    }
  ]
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
router.afterEach((to, from) => {
  // Limpiar mensajes de error después de la navegación
  const authStore = useAuthStore()
  authStore.clearErrors()
})

export default router
