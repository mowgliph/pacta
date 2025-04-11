import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from '@/renderer/hooks/use-toast';
import { useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { fetchUserProfile, updateUserProfile } from '@/renderer/api/electronAPI';
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/renderer/components/ui/card";
import { Loader2 } from 'lucide-react';

const UserProfile = () => {
  const [, navigate] = useLocation();
  const { user, setUser, logout } = useStore((state) => ({
    user: state.user,
    setUser: state.setUser,
    logout: state.logout,
  }));
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingData(true);
      try {
        const profileData = await fetchUserProfile();
        if (profileData) {
          reset({
            username: profileData.username,
            email: profileData.email,
            notifications: profileData.settings?.notifications || false,
          });
        } else {
          toast({ title: 'Error', description: 'No se pudieron cargar los datos del perfil.', variant: 'destructive' });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({ title: 'Error', description: 'Ocurrió un error al cargar el perfil.', variant: 'destructive' });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProfile();
  }, [reset, toast]);

  const onSubmit = async (data) => {
    const updateData = { ...data };
    if (!updateData.password) {
      delete updateData.password;
    }

    try {
      const updatedProfile = await updateUserProfile(updateData);
      if (updatedProfile) {
        toast({ title: 'Éxito', description: 'Perfil actualizado correctamente.' });
        reset(updatedProfile);
      } else {
        toast({ title: 'Error', description: 'No se pudo actualizar el perfil.', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: 'Error', description: `Ocurrió un error al actualizar: ${error.message || 'Error desconocido'}`, variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span>Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Perfil de Usuario</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                type="text"
                {...register('username', { required: 'El nombre de usuario es requerido' })}
                readOnly
                className="mt-1 bg-gray-100"
              />
              {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Dirección de email inválida" }
                })}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Nueva Contraseña (dejar en blanco para no cambiar)</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isSubmitting}
                autoComplete="new-password"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="notifications"
                {...register('notifications')}
                disabled={isSubmitting}
              />
              <Label htmlFor="notifications" className="font-normal cursor-pointer">
                Recibir notificaciones por email
              </Label>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UserProfile;