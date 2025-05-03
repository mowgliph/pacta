"use client"
import { useState, useEffect } from "react"
import { useAuth } from "../../store/auth"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { ThemeToggle } from "../../components/ui/theme-toggle"

function useToast() {
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(t)
    }
  }, [toast])
  return {
    toast,
    showSuccess: (message: string) => setToast({ type: "success", message }),
    showError: (message: string) => setToast({ type: "error", message }),
    hide: () => setToast(null),
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast, showSuccess, showError, hide } = useToast()

  if (!user) {
    router.replace("/login")
    return null
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await window.Electron.users.update({ id: user.id, name, email })
      if (res.success) {
        showSuccess("Perfil actualizado correctamente.")
      } else {
        showError(res.error || "No se pudo actualizar el perfil.")
      }
    } catch (err: any) {
      showError(err.message || "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (!password || !newPassword) {
      showError("Completa ambos campos de contraseña.")
      setLoading(false)
      return
    }
    try {
      const res = await window.Electron.users.changePassword({ id: user.id, password, newPassword })
      if (res.success) {
        showSuccess("Contraseña actualizada correctamente.")
        setPassword(""); setNewPassword("")
      } else {
        showError(res.error || "No se pudo actualizar la contraseña.")
      }
    } catch (err: any) {
      showError(err.message || "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 flex flex-col gap-8">
      {toast && (
        <div
          className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300
            ${toast.type === "success" ? "bg-[#4CAF50]" : "bg-[#F44336]"}`}
          onClick={hide}
        >
          {toast.message}
        </div>
      )}
      <h1 className="text-2xl font-semibold text-[#001B48] font-inter mb-2">Ajustes</h1>
      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil de usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Correo electrónico</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-fit mt-2" disabled={loading}>Guardar cambios</Button>
          </form>
        </CardContent>
      </Card>
      {/* Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña actual</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-fit mt-2" disabled={loading}>Actualizar contraseña</Button>
          </form>
        </CardContent>
      </Card>
      {/* Preferencias */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm">Tema:</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
      {/* Placeholder para futuras opciones */}
      <Card>
        <CardHeader>
          <CardTitle>Opciones avanzadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-[#757575] text-sm">Próximamente podrás configurar más opciones de la aplicación.</div>
        </CardContent>
      </Card>
    </div>
  )
} 