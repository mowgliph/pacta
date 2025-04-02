import { createFileRoute, redirect } from '@tanstack/react-router'
import { useStore } from '@/store'

/**
 * Ruta raíz que redirige según el estado de autenticación
 */
export const Route = createFileRoute('/')({
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