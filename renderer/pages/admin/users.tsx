"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { 
  AlertCircle, 
  Check, 
  Pencil,
  Search, 
  Trash2, 
  UserPlus, 
  X
} from "lucide-react"
import { Spinner } from "../../components/ui/spinner"
import { withAuth } from "../../context/auth-provider"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { User } from "../../types/auth"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"

// Interfaz para el formulario de creación de usuario
interface UserFormData {
  name: string
  email: string
  password: string
  roleId: string
  isActive: boolean
}

// Componente principal de la página de gestión de usuarios
function UsersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    roleId: "ra", // Por defecto rol RA
    isActive: true
  })
  const [roles, setRoles] = useState([
    { id: "admin", name: "Admin" },
    { id: "ra", name: "Responsable de Área" },
  ])
  
  const router = useRouter()

  // Cargar lista de usuarios y roles
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Intentar cargar roles primero
        try {
          const rolesData = await window.Electron.roles.getAll()
          if (rolesData && rolesData.length > 0) {
            setRoles(rolesData)
          }
        } catch (error) {
          console.error("Error al cargar roles:", error)
        }

        // Cargar usuarios
        const usersData = await window.Electron.users.list()
        setUsers(usersData || [])
        setIsLoading(false)
      } catch (error) {
      console.error("Error al cargar usuarios:", error)
        toast.error("No se pudieron cargar los usuarios")
        
        // Si hay un error en producción, usamos datos de ejemplo
        if (process.env.NODE_ENV === 'development') {
          // Simulación para desarrollo
          setTimeout(() => {
            setUsers([
              {
                id: "1",
                name: "Administrador",
                email: "admin@ejemplo.com",
                role: { id: "1", name: "Admin" },
                isActive: true,
                lastLogin: new Date().toISOString(),
                createdAt: "2023-01-01T12:00:00Z"
              },
              {
                id: "2",
                name: "Juan Pérez",
                email: "juan@ejemplo.com",
                role: { id: "2", name: "RA" },
                isActive: true,
                lastLogin: new Date().toISOString(),
                createdAt: "2023-05-15T10:30:00Z"
              },
              {
                id: "3",
                name: "Ana López",
                email: "ana@ejemplo.com",
                role: { id: "2", name: "RA" },
                isActive: false,
                lastLogin: "2023-09-10T08:45:00Z",
                createdAt: "2023-02-20T14:15:00Z"
              }
            ]);
          }, 500);
        }
        
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar usuarios según término de búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manejar cambio de rol
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, roleId: value }))
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      roleId: "ra",
      isActive: true
    })
  }

  // Crear nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Usar la API real
      const newUser = await window.Electron.users.create(formData)
      
      // Si la creación fue exitosa, añadir a la lista de usuarios
      if (newUser) {
        setUsers(prev => [...prev, newUser])
        setIsCreateDialogOpen(false)
        resetForm()
        toast.success("Usuario creado correctamente")
      }
    } catch (error: any) {
      console.error("Error al crear usuario:", error)
      toast.error(error.message || "No se pudo crear el usuario")
    } finally {
      setIsLoading(false)
    }
  }

  // Cambiar estado de un usuario (activar/desactivar)
  const handleToggleUserStatus = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      // Usar la API real
      const result = await window.Electron.users.toggleActive(selectedUser.id)
      
      if (result && result.success) {
        setUsers(prev => 
          prev.map(user => 
            user.id === selectedUser.id 
              ? { ...user, isActive: result.isActive } 
              : user
          )
        )
        setIsStatusDialogOpen(false)
        setSelectedUser(null)
        toast.success(`Usuario ${selectedUser.isActive ? "desactivado" : "activado"} correctamente`)
      }
    } catch (error: any) {
      console.error("Error al cambiar estado del usuario:", error)
      toast.error(error.message || "No se pudo cambiar el estado del usuario")
    } finally {
      setIsLoading(false)
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Nunca"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {isLoading && users.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>Gestione los usuarios, sus roles y permisos.</CardDescription>
            
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
              </CardHeader>
              <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-lg font-medium">No se encontraron usuarios</p>
                <p className="text-muted-foreground">
                  Intente con otros términos de búsqueda o cree un nuevo usuario.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive ? "default" : "secondary"}
                            className={user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {user.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.lastLogin)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Abrir menú</span>
                                <Pencil className="h-4 w-4" />
                          </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsStatusDialogOpen(true)
                                }}
                              >
                                {user.isActive ? (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    <span>Desactivar</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    <span>Activar</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  toast.info("Función de edición no implementada en esta versión")
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
              </CardContent>
            </Card>
      )}

      {/* Modal para crear nuevo usuario */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete el formulario para crear un nuevo usuario en el sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
          <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Correo
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Rol
                </Label>
                <Select 
                  onValueChange={handleRoleChange} 
                  defaultValue={formData.roleId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}
              >
              Cancelar
            </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                Crear Usuario
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para activar/desactivar usuario */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.isActive ? "Desactivar" : "Activar"} Usuario
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.isActive 
                ? "El usuario no podrá acceder al sistema después de ser desactivado. ¿Desea continuar?"
                : "El usuario podrá acceder al sistema de nuevo. ¿Desea continuar?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleUserStatus}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Exportar el componente protegido con el HOC withAuth
export default withAuth(UsersPage, ['Admin'])
