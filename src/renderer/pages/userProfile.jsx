import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/renderer/hooks/use-toast';
import { useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { fetchUserProfile, updateUserProfile } from '@/renderer/api/electronAPI';
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import { Checkbox } from "@/renderer/components/ui/checkbox";

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
  }, [reset]);

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
    return <div className="p-8 text-center">Cargando perfil...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
        <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <Label htmlFor="username">Nombre de Usuario</Label>
          <Input
            id="username"
            type="text"
            {...register('username', { required: 'El nombre de usuario es requerido' })}
            readOnly
            className="bg-gray-100"
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
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="notifications"
            {...register('notifications')}
            disabled={isSubmitting}
          />
          <Label htmlFor="notifications" className="font-normal">Recibir notificaciones por email</Label>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </div>
  );
};

export default UserProfile;