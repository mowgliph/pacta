"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { LoadingSpinner } from "../ui/loading-spinner"
import { useToast } from "../ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

// Esquema de validación para edición de usuario
const userEditSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  role: z.enum(["Admin", "RA"]),
})

// Esquema de validación para cambio de contraseña
const passwordChangeSchema = z
  .object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "La confirmación debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type UserEditFormValues = z.infer<typeof userEditSchema>
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>

interface EditUserDialogProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onSuccess?: () => void
}

export function EditUserDialog({ isOpen, onClose, user, onSuccess }: EditUserDialogProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Formulario de edición de usuario
  const userForm = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })

  // Formulario de cambio de contraseña
  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmitUserEdit = async (data: UserEditFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Usuario actualizado correctamente",
        })
        onSuccess?.()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "No se pudo actualizar el usuario",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitPasswordChange = async (data: PasswordChangeFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: data.password }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Contraseña actualizada correctamente",
        })
        passwordForm.reset()
        setActiveTab("details")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "No se pudo actualizar la contraseña",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la contraseña",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="password">Contraseña</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={userForm.handleSubmit(onSubmitUserEdit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input id="username" value={user.username} disabled />
                <p className="text-xs text-gray-500">El nombre de usuario no se puede cambiar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" {...userForm.register("name")} placeholder="Ej: Juan Pérez" />
                {userForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{userForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...userForm.register("email")} placeholder="Ej: usuario@ejemplo.com" />
                {userForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{userForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  defaultValue={userForm.getValues("role")}
                  onValueChange={(value) => userForm.setValue("role", value as "Admin" | "RA")}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Administrador</SelectItem>
                    <SelectItem value="RA">Responsable de Área</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input id="password" type="password" {...passwordForm.register("password")} />
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Cambiando...
                    </>
                  ) : (
                    "Cambiar Contraseña"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
