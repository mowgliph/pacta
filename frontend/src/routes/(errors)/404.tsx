import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

/**
 * Página 404 personalizada para rutas no encontradas
 */
export function NotFoundComponent() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="container flex max-w-md flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Página no encontrada</h1>
        <p className="text-muted-foreground">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 