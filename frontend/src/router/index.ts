import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: 'contracts',
          name: 'contracts',
          component: () => import('../views/contracts/ContractsView.vue')
        },
        {
          path: 'users',
          name: 'users',
          meta: { requiresAdmin: true },
          component: () => import('../views/users/UsersView.vue')
        },
        {
          path: 'licenses',
          name: 'licenses',
          meta: { requiresAdmin: true },
          component: () => import('../views/licenses/LicensesView.vue')
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/about/AboutView.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
