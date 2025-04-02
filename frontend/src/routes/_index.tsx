import { redirect } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

// Ruta para la página de inicio que redirige a la ruta autenticada
export const Route = createFileRoute('/_index')({
  component: IndexComponent,
  beforeLoad: () => {
    throw redirect({
      to: '/_authenticated/dashboard',
      replace: true
    })
  }
})

// Componente que redirige a la ruta autenticada
export function IndexComponent() {
  // Este componente nunca se renderiza realmente debido a la redirección en beforeLoad
  return null
}

// Función que se ejecuta antes de cargar la ruta
export function indexLoader() {
  // Redirigir a la ruta autenticada
  throw redirect({
    to: '/_authenticated',
    replace: true
  })
} 