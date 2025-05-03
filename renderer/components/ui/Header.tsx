"use client"
import { Bell, LogOut, LogIn, Settings } from "lucide-react"
import { useAuth } from "../../store/auth"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  return (
    <header className="w-full h-16 bg-white flex items-center justify-between px-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-[#001B48] font-inter">Dashboard</h1>
        <span className="text-xs text-[#757575]">Gestión de contratos empresariales</span>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative">
          <Bell size={22} className="text-[#018ABE]" />
          <span className="absolute -top-1 -right-1 bg-[#F44336] text-white text-xs rounded-full px-1.5 py-0.5">3</span>
        </button>
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#97CADB] flex items-center justify-center text-[#001B48] font-bold">
            {user ? user.name?.[0]?.toUpperCase() || "U" : "U"}
          </div>
          <div className="text-[#333] text-sm">
            <div className="font-semibold">{user ? user.name : "Invitado"}</div>
            <div className="text-xs text-[#757575]">{user ? user.role : "Sin sesión"}</div>
          </div>
          {user && (
            <button
              className="flex items-center gap-1 text-[#018ABE] text-xs ml-2"
              onClick={() => router.push("/settings")}
            >
              <Settings size={16} /> Configuración
            </button>
          )}
          {user ? (
            <button
              className="flex items-center gap-1 text-[#F44336] text-xs ml-2"
              onClick={logout}
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          ) : (
            <button
              className="flex items-center gap-1 text-[#018ABE] text-xs ml-2"
              onClick={() => router.push("/login")}
            >
              <LogIn size={16} /> Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  )
} 