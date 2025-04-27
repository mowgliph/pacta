"use client"

import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { PermissionGate } from "../auth/permission-gate"
import { FileText, Users, Settings, BarChart, Shield, LogIn, Home, User, Menu, X, PlusCircle } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"

export function SidebarNav() {
  const router = useRouter()
  const { logout, user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/auth")
  }

  const navigateToLogin = () => {
    router.push("/auth")
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const navItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
      permission: { resource: "contracts" as const, action: "read" as const },
    },
    {
      title: "Contratos",
      icon: <FileText className="h-5 w-5" />,
      href: "/contracts",
      permission: { resource: "contracts" as const, action: "read" as const },
    },
    {
      title: "Usuarios",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
      permission: { resource: "users" as const, action: "read" as const },
    },
    {
      title: "Roles",
      icon: <Shield className="h-5 w-5" />,
      href: "/admin/roles",
      permission: { resource: "users" as const, action: "assign_roles" as const },
    },
    {
      title: "Reportes",
      icon: <BarChart className="h-5 w-5" />,
      href: "/reports",
      permission: { resource: "reports" as const, action: "view" as const },
    },
    {
      title: "Configuración",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
      permission: { resource: "settings" as const, action: "view" as const },
    },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} aria-hidden="true"></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#eef0eb] dark:bg-gray-800 z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y nombre */}
          <div className="p-4 flex items-center">
            <div className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="PACTA Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <h2 className="text-xl font-bold">PACTA</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={closeSidebar} className="ml-auto lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <PermissionGate key={item.href} resource={item.permission.resource} action={item.permission.action}>
                  <Button
                    variant={router.pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      router.push(item.href)
                      closeSidebar()
                    }}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Button>
                </PermissionGate>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogIn className="h-5 w-5 mr-3 rotate-180" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Usuario invitado</p>
                    <p className="text-sm text-gray-500">Acceso limitado</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full justify-start" onClick={navigateToLogin}>
                  <LogIn className="h-5 w-5 mr-3" />
                  Iniciar sesión
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
