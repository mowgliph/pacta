"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useToast } from "../../hooks/use-toast"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Checkbox } from "../../components/ui/checkbox"
import { Label } from "../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { AlertCircle, Edit, Trash, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Spinner } from "../../components/ui/spinner"
import { getRoles, createRole, updateRole, deleteRole as deleteRoleAPI } from "../../lib/api"

// Tipos para roles y permisos
interface Permission {
  create?: boolean
  read?: boolean
  update?: boolean
  delete?: boolean
  approve?: boolean
  assign?: boolean
  export?: boolean
  view?: boolean
  assign_roles?: boolean
}

interface Permissions {
  contracts: Permission
  users: Permission
  reports: Permission
  settings: Permission
}

interface Role {
  _id: string
  name: string
  description: string
  permissions: Permissions
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: {
      contracts: {
        create: false,
        read: true,
        update: false,
        delete: false,
        approve: false,
        assign: false,
        export: false,
      },
      users: {
        create: false,
        read: false,
        update: false,
        delete: false,
        assign_roles: false,
      },
      reports: {
        view: false,
        export: false,
        create: false,
      },
      settings: {
        view: false,
        update: false,
      },
    },
  })
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  // Cargar roles al iniciar
  useEffect(() => {
    fetchRoles()
  }, [])

  // Función para obtener roles
  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const rolesData = await getRoles();
      
      // Mapear los datos de la API al formato esperado por el componente
      const mappedRoles = rolesData.map(role => ({
        _id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }));
      
      setRoles(mappedRoles);
    } catch (error: any) {
      console.error("Error al cargar roles:", error)
      toast({
        title: "Error",
        description: error.message || "Error al cargar roles",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para abrir el diálogo de creación/edición
  const openDialog = (role?: Role) => {
    if (role) {
      // Editar rol existente
      setSelectedRole(role)
      setFormData({
        name: role.name,
        description: role.description,
        permissions: JSON.parse(JSON.stringify(role.permissions)), // Copia profunda
      })
    } else {
      // Nuevo rol
      setSelectedRole(null)
      setFormData({
        name: "",
        description: "",
        permissions: {
          contracts: {
            create: false,
            read: true,
            update: false,
            delete: false,
            approve: false,
            assign: false,
            export: false,
          },
          users: {
            create: false,
            read: false,
            update: false,
            delete: false,
            assign_roles: false,
          },
          reports: {
            view: false,
            export: false,
            create: false,
          },
          settings: {
            view: false,
            update: false,
          },
        },
      })
    }

    setFormErrors({ name: "", description: "" })
    setIsDialogOpen(true)
  }

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Función para manejar cambios en los permisos
  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [resource]: {
          ...prev.permissions[resource as keyof typeof prev.permissions],
          [action]: checked,
        },
      },
    }))
  }

  // Función para validar el formulario
  const validateForm = () => {
    const errors = {
      name: "",
      description: "",
    }

    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio"
    }

    if (!formData.description.trim()) {
      errors.description = "La descripción es obligatoria"
    }

    setFormErrors(errors)
    return !errors.name && !errors.description
  }

  // Función para guardar rol
  const saveRole = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)

      if (selectedRole) {
        // Actualizar rol existente
        await updateRole(selectedRole._id, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
        
        toast({
          title: "Éxito",
          description: "Rol actualizado correctamente"
        });
      } else {
        // Crear nuevo rol
        const newRole = await createRole({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
        
        toast({
          title: "Éxito",
          description: "Rol creado correctamente"
        });
      }

      setIsDialogOpen(false)
      fetchRoles()
    } catch (error: any) {
      console.error("Error al guardar rol:", error)
      toast({
        title: "Error",
        description: error.message || "Error al guardar rol",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para eliminar rol
  const deleteRole = async () => {
    if (!selectedRole) return

    try {
      setIsLoading(true)
      await deleteRoleAPI(selectedRole._id);
      
      toast({
        title: "Éxito",
        description: "Rol eliminado correctamente"
      });

      setIsDeleteDialogOpen(false)
      fetchRoles()
    } catch (error: any) {
      console.error("Error al eliminar rol:", error)
      toast({
        title: "Error",
        description: error.message || "Error al eliminar rol",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para confirmar eliminación
  const confirmDelete = (role: Role) => {
    setSelectedRole(role)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Roles y Permisos</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </div>

      {isLoading && !isDialogOpen && !isDeleteDialogOpen ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {roles.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sin roles</AlertTitle>
              <AlertDescription>
                No hay roles definidos en el sistema. Cree un nuevo rol para comenzar.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Roles del Sistema</CardTitle>
                <CardDescription>
                  Gestione los roles y permisos para controlar el acceso a las funcionalidades del sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>{role.isSystem ? "Sistema" : "Personalizado"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDialog(role)} disabled={role.isSystem}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(role)}
                            disabled={role.isSystem}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Diálogo para crear/editar rol */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRole ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
            <DialogDescription>
              {selectedRole
                ? "Modifique los detalles y permisos del rol seleccionado."
                : "Complete los detalles y asigne los permisos para el nuevo rol."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre del rol"
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción del rol"
                />
                {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Permisos</h3>

              <Tabs defaultValue="contracts">
                <TabsList className="mb-4">
                  <TabsTrigger value="contracts">Contratos</TabsTrigger>
                  <TabsTrigger value="users">Usuarios</TabsTrigger>
                  <TabsTrigger value="reports">Reportes</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>

                <TabsContent value="contracts">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contracts-create"
                        checked={formData.permissions.contracts.create}
                        onCheckedChange={(checked) => handlePermissionChange("contracts", "create", checked === true)}
                      />
                      <Label htmlFor="contracts-create">Crear contratos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contracts-read"
                        checked={formData.permissions.contracts.read}
                        onCheckedChange={(checked) => handlePermissionChange("contracts", "read", checked === true)}
                      />
                      <Label htmlFor="contracts-read">Ver contratos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contracts-update"
                        checked={formData.permissions.contracts.update}
                        onCheckedChange={(checked) => handlePermissionChange("contracts", "update", checked === true)}
                      />
                      <Label htmlFor="contracts-update">Editar contratos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contracts-delete"
                        checked={formData.permissions.contracts.delete}
                        onCheckedChange={(checked) => handlePermissionChange("contracts", "delete", checked === true)}
                      />
                      <Label htmlFor="contracts-delete">Eliminar contratos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contracts-approve"
                        checked={formData.permissions.contracts.approve}
                        onCheckedChange={(checked) => handlePermissionChange("contracts", "approve", checked === true)}
                      />
                      <Label htmlFor="contracts-approve">Aprobar contratos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contracts-assign"
                        checked={formData.permissions.contracts.assign}
                        onCheckedChange={(checked) => handlePermissionChange("contracts", "assign", checked === true)}
                      />
                      <Label htmlFor="contracts-assign">Asignar contratos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contracts-export"
                        checked={formData.permissions.contracts.export}
                        onCheckedChange={(checked) => handlePermissionChange("contracts", "export", checked === true)}
                      />
                      <Label htmlFor="contracts-export">Exportar contratos</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="users">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-create"
                        checked={formData.permissions.users.create}
                        onCheckedChange={(checked) => handlePermissionChange("users", "create", checked === true)}
                      />
                      <Label htmlFor="users-create">Crear usuarios</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-read"
                        checked={formData.permissions.users.read}
                        onCheckedChange={(checked) => handlePermissionChange("users", "read", checked === true)}
                      />
                      <Label htmlFor="users-read">Ver usuarios</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-update"
                        checked={formData.permissions.users.update}
                        onCheckedChange={(checked) => handlePermissionChange("users", "update", checked === true)}
                      />
                      <Label htmlFor="users-update">Editar usuarios</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-delete"
                        checked={formData.permissions.users.delete}
                        onCheckedChange={(checked) => handlePermissionChange("users", "delete", checked === true)}
                      />
                      <Label htmlFor="users-delete">Eliminar usuarios</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-assign_roles"
                        checked={formData.permissions.users.assign_roles}
                        onCheckedChange={(checked) => handlePermissionChange("users", "assign_roles", checked === true)}
                      />
                      <Label htmlFor="users-assign_roles">Asignar roles</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reports">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reports-view"
                        checked={formData.permissions.reports.view}
                        onCheckedChange={(checked) => handlePermissionChange("reports", "view", checked === true)}
                      />
                      <Label htmlFor="reports-view">Ver reportes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reports-export"
                        checked={formData.permissions.reports.export}
                        onCheckedChange={(checked) => handlePermissionChange("reports", "export", checked === true)}
                      />
                      <Label htmlFor="reports-export">Exportar reportes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reports-create"
                        checked={formData.permissions.reports.create}
                        onCheckedChange={(checked) => handlePermissionChange("reports", "create", checked === true)}
                      />
                      <Label htmlFor="reports-create">Crear reportes</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="settings-view"
                        checked={formData.permissions.settings.view}
                        onCheckedChange={(checked) => handlePermissionChange("settings", "view", checked === true)}
                      />
                      <Label htmlFor="settings-view">Ver configuración</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="settings-update"
                        checked={formData.permissions.settings.update}
                        onCheckedChange={(checked) => handlePermissionChange("settings", "update", checked === true)}
                      />
                      <Label htmlFor="settings-update">Modificar configuración</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveRole} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <Spinner className="mr-2" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <span>Guardar</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el rol "{selectedRole?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteRole} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <Spinner className="mr-2" />
                  <span>Eliminando...</span>
                </div>
              ) : (
                <span>Eliminar</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
