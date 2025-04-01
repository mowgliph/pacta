import { Outlet, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

/**
 * Ruta principal para todas las páginas autenticadas
 * Esta ruta proporciona el layout del dashboard y se asegura de que
 * el usuario esté autenticado para acceder a las páginas protegidas
 */

// Componente para la ruta autenticada
export function AuthenticatedComponent() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

// Función que se ejecuta antes de cargar la ruta
export function authenticatedLoader() {
  // Obtener el estado de autenticación
  const isAuthenticated = useStore.getState().isAuthenticated
  const token = useStore.getState().token
  
  // Si no hay token, verificar si hay uno en localStorage
  if (!isAuthenticated && !token) {
    // Redireccionar a la página de login si no está autenticado
    throw redirect({
      to: '/(auth)/login',
      replace: true
    })
  }

  return null
} 