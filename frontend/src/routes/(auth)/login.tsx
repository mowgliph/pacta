import { redirect } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { useStore } from '@/store'

/**
 * Ruta de inicio de sesión
 * Redirige al dashboard si el usuario ya está autenticado
 */
export function LoginComponent() {
  return <LoginPage />
}

// Función que se ejecuta antes de cargar la ruta de login
export function loginLoader() {
  const isAuthenticated = useStore.getState().isAuthenticated
  
  // Si el usuario ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    throw redirect({
      to: '/_authenticated',
      replace: true
    })
  }

  return null
} 