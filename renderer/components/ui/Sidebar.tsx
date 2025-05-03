"use client"
import { Home, BarChart2, FileText, Users, Bell, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menu = [
  { label: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
  { label: "Estadísticas", icon: <BarChart2 size={20} />, href: "/statistics" },
  { label: "Contratos", icon: <FileText size={20} />, href: "/contracts" },
  { label: "Usuarios", icon: <Users size={20} />, href: "/users" },
  { label: "Notificaciones", icon: <Bell size={20} />, href: "/notifications" },
  { label: "Configuración", icon: <Settings size={20} />, href: "/settings" },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="h-screen w-64 bg-[#001B48] flex flex-col justify-between py-6 px-4">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="text-2xl font-bold text-white tracking-wide">PACTA</span>
        </div>
        <nav className="flex flex-col gap-1">
          {menu.map(({ label, icon, href }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                  active
                    ? "bg-[#D6E8EE] text-[#018ABE]"
                    : "text-white hover:bg-[#02457A]/60"
                }`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#97CADB] flex items-center justify-center text-[#001B48] font-bold">
            U
          </div>
          <div className="text-white text-sm">
            <div className="font-semibold">Usuario</div>
            <div className="text-xs opacity-70">Rol</div>
          </div>
        </div>
        <button
          className="flex items-center gap-2 text-white/80 hover:text-[#F44336] mt-4 text-sm"
          onClick={() => window.Electron?.auth?.logout()}
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </aside>
  )
} 