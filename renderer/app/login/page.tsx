"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../store/auth"
import { Form } from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card"

export default function LoginPage() {
  const { login, error, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const success = await login({ email, password })
    if (success) {
      router.replace("/dashboard")
    } else {
      setFormError(error || "Error de autenticación")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5] flex-col">
      <img src="/images/logo.png" alt="Logo PACTA" className="w-16 h-16 mb-6" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-4"
            />
            {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </Form>
        </CardContent>
        <CardFooter>
          <span className="text-xs text-muted-foreground">PACTA &copy; {new Date().getFullYear()}</span>
        </CardFooter>
      </Card>
    </div>
  )
} 