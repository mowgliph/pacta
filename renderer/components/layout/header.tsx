import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Bell, Search, Sun, Moon, Plus, LogIn, User } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "../../hooks/useAuth"

export function Header() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [pageTitle, setPageTitle] = useState("")
  const currentDate = new Date()
  
  // Determinar el título de la página basado en la ruta actual
  useEffect(() => {
    const pathParts = router.pathname.split("/").filter(Boolean)
    
    if (pathParts.length === 0) {
      setPageTitle("Dashboard")
      return
    }
    
    // Manejar casos especiales
    if (pathParts[0] === "dashboard") {
      setPageTitle("Dashboard")
    } else if (pathParts[0] === "contracts") {
      if (pathParts.length === 1) {
        setPageTitle("Contratos")
      } else if (pathParts[1] === "new") {
        setPageTitle("Nuevo Contrato")
      } else if (pathParts[1] === "edit") {
        setPageTitle("Editar Contrato")
      }
    } else if (pathParts[0] === "admin") {
      if (pathParts[1] === "users") {
        setPageTitle("Usuarios")
      } else if (pathParts[1] === "roles") {
        setPageTitle("Roles")
      }
    } else if (pathParts[0] === "reports") {
      setPageTitle("Reportes")
    } else if (pathParts[0] === "settings") {
      setPageTitle("Configuración")
    } else {
      // Capitalizar primera letra
      setPageTitle(pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace(/-/g, " "))
    }
  }, [router.pathname])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navigateToLogin = () => {
    router.push("/auth")
  }
  
  return (
    <motion.header 
      className="sticky top-0 z-20 app-background"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-16 px-4 flex items-center justify-between lg:px-6">
        {/* Título de la página y fecha */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">{pageTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(currentDate, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-[200px] pl-8 h-9 rounded-full bg-gray-50 dark:bg-gray-700 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </Button>
          
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {/* User profile */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">
                  {user?.name || "Usuario"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem onClick={navigateToLogin}>
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={navigateToLogin}>
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  )
} 