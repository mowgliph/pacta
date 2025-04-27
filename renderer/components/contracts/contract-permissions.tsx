"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Spinner } from "../ui/spinner";
import { Shield, UserPlus } from "lucide-react";
import {
  getRoles,
  getContracts,
  getUsers,
  updateContractAccessControl,
  assignUsersToContract,
} from "../../lib/api";
import type { Contract, Roles, User, UserPermission } from "../../types/index";

interface ContractPermissionsProps {
  contract: Contract;
  onUpdate: () => void;
}

export function ContractPermissions({
  contract,
  onUpdate,
}: ContractPermissionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [restricted, setRestricted] = useState(
    contract.accessControl?.restricted || false
  );
  const [allowedRoles, setAllowedRoles] = useState<string[]>(
    contract.accessControl?.allowedRoles?.map((role) =>
      typeof role === "object" ? role.id : role
    ) || []
  );
  const [roles, setRoles] = useState<Roles[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserPermission[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { toast } = useToast();

  // Cargar roles y usuarios al iniciar
  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  // Función para obtener roles
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const fetchedRoles = await getRoles();
      setRoles(fetchedRoles);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener usuarios
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar cambios en los roles permitidos
  const handleRoleChange = (roleId: string) => {
    setAllowedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  // Función para guardar la configuración de acceso
  const saveAccessControl = async () => {
    setIsLoading(true);
    try {
      await updateContractAccessControl(contract.id, {
        restricted,
        allowedRoles: !restricted ? allowedRoles : undefined,
      });

      toast({
        title: "Éxito",
        description: "Configuración de acceso actualizada correctamente",
      });
      setIsDialogOpen(false);

      // Notificar al componente padre de la actualización
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error al guardar la configuración de acceso:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de acceso",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para añadir un usuario a la lista de seleccionados
  const addUserToSelection = () => {
    if (!selectedUserId) return;

    const user = users.find((u) => u.id === selectedUserId);
    if (!user) return;

    // Verificar si el usuario ya está en la lista
    if (selectedUsers.some((u) => u.userId === selectedUserId)) {
      toast({
        title: "Advertencia",
        description: "Este usuario ya está en la lista",
      });
      return;
    }

    setSelectedUsers((prev) => [
      ...prev,
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        permissions: {
          read: true,
          update: false,
          delete: false,
          approve: false,
          assign: false,
        },
      },
    ]);

    setSelectedUserId("");
  };

  // Función para eliminar un usuario de la lista de seleccionados
  const removeUserFromSelection = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.userId !== userId));
  };

  // Función para manejar cambios en los permisos de un usuario
  const handleUserPermissionChange = (
    userId: string,
    permission: string,
    value: boolean
  ) => {
    setSelectedUsers((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          return {
            ...u,
            permissions: {
              ...u.permissions,
              [permission]: value,
            },
          };
        }
        return u;
      })
    );
  };

  // Función para asignar usuarios al contrato
  const assignUsers = async () => {
    setIsLoading(true);
    try {
      // Formatear los usuarios seleccionados al formato requerido por la API
      const usersToAssign = selectedUsers.map((user) => ({
        userId: user.userId,
        permissions: user.permissions,
      }));

      await assignUsersToContract(contract.id, usersToAssign);

      toast({
        title: "Éxito",
        description: "Usuarios asignados correctamente",
      });
      setIsUserDialogOpen(false);

      // Notificar al componente padre de la actualización
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error al asignar usuarios:", error);
      toast({
        title: "Error",
        description: "No se pudieron asignar los usuarios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Control de Acceso</CardTitle>
        <CardDescription>
          Configure quién puede acceder a este contrato y qué acciones puede
          realizar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-medium">Configuración de Acceso</h3>
              <p className="text-sm text-gray-500">
                {contract.accessControl?.restricted
                  ? "Este contrato está restringido. Solo los usuarios asignados pueden acceder."
                  : "Este contrato es accesible para todos los usuarios con los roles permitidos."}
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Shield className="mr-2 h-4 w-4" />
              Configurar Acceso
            </Button>
          </div>

          <div className="flex justify-between mt-6">
            <div>
              <h3 className="text-lg font-medium">Usuarios Asignados</h3>
              <p className="text-sm text-gray-500">
                Asigne usuarios específicos a este contrato con permisos
                personalizados.
              </p>
            </div>
            <Button onClick={() => setIsUserDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Asignar Usuarios
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Diálogo para configurar acceso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de Acceso</DialogTitle>
            <DialogDescription>
              Configure quién puede acceder a este contrato y qué acciones puede
              realizar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="restricted">Acceso Restringido</Label>
                <p className="text-sm text-gray-500">
                  Si está activado, solo los usuarios explícitamente asignados
                  podrán acceder al contrato.
                </p>
              </div>
              <Switch
                id="restricted"
                checked={restricted}
                onCheckedChange={setRestricted}
              />
            </div>

            {!restricted && (
              <div className="space-y-2">
                <Label>Roles Permitidos</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Seleccione los roles que pueden acceder a este contrato.
                </p>

                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={allowedRoles.includes(role.id)}
                        onCheckedChange={() => handleRoleChange(role.id)}
                      />
                      <Label htmlFor={`role-${role.id}`}>
                        {role.name} - {role.description}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveAccessControl} disabled={isLoading}>
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

      {/* Diálogo para asignar usuarios */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Asignar Usuarios</DialogTitle>
            <DialogDescription>
              Seleccione los usuarios que desea asignar a este contrato y
              configure sus permisos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor="user">Usuario</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addUserToSelection} disabled={!selectedUserId}>
                Añadir
              </Button>
            </div>

            {selectedUsers.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-lg font-medium">Usuarios Seleccionados</h3>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Usuario</th>
                        <th className="px-4 py-2 text-center">Ver</th>
                        <th className="px-4 py-2 text-center">Editar</th>
                        <th className="px-4 py-2 text-center">Eliminar</th>
                        <th className="px-4 py-2 text-center">Aprobar</th>
                        <th className="px-4 py-2 text-center">Asignar</th>
                        <th className="px-4 py-2 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUsers.map((user) => (
                        <tr key={user.userId} className="border-b">
                          <td className="px-4 py-2">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Checkbox
                              checked={user.permissions.read}
                              onCheckedChange={(checked) =>
                                handleUserPermissionChange(
                                  user.userId,
                                  "read",
                                  checked === true
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Checkbox
                              checked={user.permissions.update}
                              onCheckedChange={(checked) =>
                                handleUserPermissionChange(
                                  user.userId,
                                  "update",
                                  checked === true
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Checkbox
                              checked={user.permissions.delete}
                              onCheckedChange={(checked) =>
                                handleUserPermissionChange(
                                  user.userId,
                                  "delete",
                                  checked === true
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Checkbox
                              checked={user.permissions.approve}
                              onCheckedChange={(checked) =>
                                handleUserPermissionChange(
                                  user.userId,
                                  "approve",
                                  checked === true
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Checkbox
                              checked={user.permissions.assign}
                              onCheckedChange={(checked) =>
                                handleUserPermissionChange(
                                  user.userId,
                                  "assign",
                                  checked === true
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeUserFromSelection(user.userId)
                              }
                            >
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={assignUsers}
              disabled={isLoading || selectedUsers.length === 0}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Spinner className="mr-2" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <span>Asignar Usuarios</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
