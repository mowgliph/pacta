import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { UserForm } from '../components/UserForm';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { useCreateUser, useUpdateUser, useUser } from '../hooks/useUsers';
import { UserRole } from '../types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

export function UserManagementPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Verificar permisos
  const hasPermission = currentUser?.role === UserRole.RA || currentUser?.role === UserRole.ADMIN;
  
  // Hooks para crear/actualizar usuario
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(id || '');
  const { data: userData, isLoading: isLoadingUser } = useUser(id || '', {
    enabled: !!id && hasPermission
  });

  if (!hasPermission) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          No tienes permisos para acceder a esta página.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async (data: any) => {
    try {
      if (id) {
        await updateUser.mutateAsync(data);
        toast({
          title: "Usuario actualizado",
          description: "Los datos del usuario han sido actualizados correctamente",
        });
      } else {
        await createUser.mutateAsync(data);
        toast({
          title: "Usuario creado",
          description: "El nuevo usuario ha sido creado correctamente",
        });
      }
      navigate('/users');
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-6 space-y-6"
    >
      <PageHeader
        title={id ? "Editar Usuario" : "Crear Nuevo Usuario"}
        description={id ? "Modifica los datos del usuario" : "Añade un nuevo usuario al sistema"}
        backButton={{
          href: '/users',
          label: 'Volver a usuarios'
        }}
      />

      {isLoadingUser && id ? (
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-[400px]" />
          </div>
        </Card>
      ) : (
        <UserForm
          user={userData}
          onSubmit={handleSubmit}
          isLoading={createUser.isPending || updateUser.isPending}
        />
      )}
    </motion.div>
  );
}