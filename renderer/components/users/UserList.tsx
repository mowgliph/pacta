"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { LoadingSpinner } from "../ui/loading-spinner"
import { UserPlus, Edit, UserX, UserCheck } from "lucide-react"
import { useUsers } from "../../hooks/useUsers"
import { NewUserDialog } from "./NewUserDialog"
import { EditUserDialog } from "./EditUserDialog"
import { useToast } from "../ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"

export function UserList() {
  const { users, isLoading, fetchUsers, toggleUserStatus } = useUsers()
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleStatus = async () => {
    if (!selectedUser) return

    setIsUpdatingStatus(true)
    try {
      await toggleUserStatus(selectedUser.id)
      toast({
        title: "Éxito",
        description: `Usuario ${selectedUser.isActive ? "desactivado" : "activado"} correctamente`,
      })
      setIsStatusDialogOpen(false)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usuarios</CardTitle>
          <Button onClick={() => setIsNewUserDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <div className="bg-muted p-3 border-b">
                <div className="grid grid-cols-12 gap-2 font-medium text-sm">
                  <div className="col-span-3">Nombre</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Rol</div>
                  <div className="col-span-2">Estado</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>
              </div>

              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.id} className="p-3 hover:bg-muted/50">
                    <div className="grid grid-cols-12 gap-2 items-center text-sm">
                      <div className="col-span-3">{user.name}</div>
                      <div className="col-span-3 truncate" title={user.email}>
                        {user.email}
                      </div>
                      <div className="col-span-2">
                        <Badge
                          className={
                            user.role === "Admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <Badge className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {user.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsEditUserDialogOpen(true)
                          }}
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsStatusDialogOpen(true)
                          }}
                          title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <NewUserDialog
        isOpen={isNewUserDialogOpen}
        onClose={() => setIsNewUserDialogOpen(false)}
        onSuccess={() => {
          setIsNewUserDialogOpen(false)
          fetchUsers()
        }}
      />

      {selectedUser && (
        <EditUserDialog
          isOpen={isEditUserDialogOpen}
          onClose={() => setIsEditUserDialogOpen(false)}
          user={selectedUser}
          onSuccess={() => {
            setIsEditUserDialogOpen(false)
            fetchUsers()
          }}
        />
      )}

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser?.isActive ? "Desactivar Usuario" : "Activar Usuario"}</DialogTitle>
          </DialogHeader>
          <p>
            {selectedUser?.isActive
              ? "¿Está seguro de que desea desactivar este usuario? El usuario no podrá acceder al sistema."
              : "¿Está seguro de que desea activar este usuario? El usuario podrá acceder al sistema."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={selectedUser?.isActive ? "destructive" : "default"}
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  {selectedUser?.isActive ? "Desactivando..." : "Activando..."}
                </>
              ) : selectedUser?.isActive ? (
                "Desactivar"
              ) : (
                "Activar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
