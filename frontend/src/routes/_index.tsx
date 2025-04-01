import { redirect } from '@tanstack/react-router'

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