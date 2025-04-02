import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { useStore } from '@/store'

/**
 * Ruta para la página de login
 */
export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: () => {
    // Verificar si el usuario ya está autenticado
    const isAuthenticated = useStore.getState().isAuthenticated
    
    // Redirigir al dashboard si ya está autenticado
    if (isAuthenticated) {
      throw redirect({
        to: '/dashboard',
        replace: true
      })
    }
    
    return null
  }
}) 