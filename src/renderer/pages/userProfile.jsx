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
import { Skeleton, SkeletonCard } from '@/renderer/components/ui/skeleton';
import { HoverElevation, HoverScale, HoverGlow, HoverBounce } from '@/renderer/components/ui/micro-interactions';
import { User, Settings, Shield } from 'lucide-react';
import { Save } from 'lucide-react';

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
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8" role="main" aria-label="Perfil de usuario">
      <div className="flex justify-between items-center">
        <HoverScale>
          <h1 className="text-2xl font-bold" aria-level="1">Mi Perfil</h1>
        </HoverScale>
        <HoverBounce>
          <Button 
            onClick={handleSubmit(onSubmit)}
            className="flex items-center"
            aria-label="Guardar cambios del perfil"
          >
            <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            Guardar Cambios
          </Button>
        </HoverBounce>
      </div>

      <div className="grid gap-6 md:grid-cols-2" role="region" aria-label="Información del perfil">
        <HoverElevation>
          <Card role="article" aria-label="Información personal">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" aria-hidden="true" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Nombre Completo
                </label>
                <div className="mt-1">
                  <Input
                    id="name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                    aria-required="true"
                    aria-describedby="name-error"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600" id="name-error" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Correo Electrónico
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                    aria-required="true"
                    aria-describedby="email-error"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600" id="email-error" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                  Teléfono
                </label>
                <div className="mt-1">
                  <Input
                    id="phone"
                    {...register('phone')}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </HoverElevation>

        <HoverElevation>
          <Card role="article" aria-label="Preferencias de cuenta">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" aria-hidden="true" />
                Preferencias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Input
                  type="checkbox"
                  id="notifications"
                  {...register('notifications')}
                  className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  aria-label="Recibir notificaciones"
                />
                <Label htmlFor="notifications" className="ml-2 block text-sm text-foreground">
                  Recibir notificaciones
                </Label>
              </div>

              <div className="flex items-center">
                <Input
                  type="checkbox"
                  id="darkMode"
                  {...register('darkMode')}
                  className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  aria-label="Modo oscuro"
                />
                <Label htmlFor="darkMode" className="ml-2 block text-sm text-foreground">
                  Modo oscuro
                </Label>
              </div>
            </CardContent>
          </Card>
        </HoverElevation>
      </div>

      <HoverGlow>
        <Card role="article" aria-label="Seguridad de la cuenta">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" aria-hidden="true" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">
                Contraseña Actual
              </label>
              <div className="mt-1">
                <Input
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword')}
                  className={errors.currentPassword ? 'border-red-500' : ''}
                  aria-required="true"
                  aria-describedby="current-password-error"
                />
              </div>
              {errors.currentPassword && (
                <p className="mt-2 text-sm text-red-600" id="current-password-error" role="alert">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
                Nueva Contraseña
              </label>
              <div className="mt-1">
                <Input
                  id="newPassword"
                  type="password"
                  {...register('newPassword')}
                  className={errors.newPassword ? 'border-red-500' : ''}
                  aria-required="true"
                  aria-describedby="new-password-error"
                />
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600" id="new-password-error" role="alert">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </HoverGlow>
    </div>
  );
};

export default UserProfile;