import { Outlet, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useStore } from '@/store'

/**
 * Ruta para páginas de autenticación (login, registro, recuperación de contraseña)
 */
export function AuthComponent() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}

// Función que se ejecuta antes de cargar la ruta
export function authLoader() {
  // Si el usuario ya está autenticado, redireccionar al dashboard
  const isAuthenticated = useStore.getState().isAuthenticated
  
  if (isAuthenticated) {
    throw redirect({
      to: '/_authenticated/dashboard',
      replace: true
    })
  }

  return null
}

// Componente de layout para las páginas de autenticación
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">PACTA</h1>
            <p className="text-muted-foreground">
              Gestión de contratos y proveedores
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
} 