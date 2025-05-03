"use client"
import { Bell } from "lucide-react"

export default function Header() {
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
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#97CADB] flex items-center justify-center text-[#001B48] font-bold">
            U
          </div>
          <div className="text-[#333] text-sm">
            <div className="font-semibold">Usuario</div>
            <div className="text-xs text-[#757575]">Rol</div>
          </div>
        </div>
      </div>
    </header>
  )
} 