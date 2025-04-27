import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="app-background py-4 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            <div className="font-bold text-lg mr-2">PACTA</div>
            <span className="text-gray-500 text-sm">
              &copy; {currentYear} Todos los derechos reservados
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <Link href="/terms" className="text-gray-500 hover:text-primary transition-colors">
              Términos de Servicio
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-primary transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/help" className="text-gray-500 hover:text-primary transition-colors">
              Ayuda
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-primary transition-colors">
              Contacto
            </Link>
          </div>
          
          <div className="mt-4 md:mt-0 text-xs text-gray-400">
            Versión 1.0.0
          </div>
        </div>
      </div>
    </footer>
  )
} 