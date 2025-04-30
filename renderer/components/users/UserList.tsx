"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { UserPlus, Edit, UserX, UserCheck } from "lucide-react";
import { useUsers } from "../../hooks/useUsers";
import { NewUserDialog } from "./NewUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, UserRole } from "@/types/user.types";

export const UserList = () => {
  const { getAllUsers, toggleUserActive, isLoading, error } = useUsers();
  const [users, setUsers] = useState<User[]>([]);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const users = await getAllUsers();
    setUsers(users);
  };

  const handleToggleActive = async (id: string) => {
    const updatedUser = await toggleUserActive(id);
    if (updatedUser) {
      setUsers(users.map((user) => (user.id === id ? updatedUser : user)));
      toast({
        title: "Éxito",
        description: "Estado del usuario actualizado correctamente",
      });
    }
  };

  if (isLoading) {
    return <div>Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Último acceso</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role === UserRole.ADMIN ? "default" : "secondary"
                  }
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "default" : "destructive"}>
                  {user.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : "Nunca"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(user.id)}
                >
                  {user.isActive ? "Desactivar" : "Activar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
