import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/renderer/hooks/use-toast';
import { useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { loginUser } from '@/renderer/api/electronAPI';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';

const Auth = () => {
  const [, navigate] = useLocation();
  const setUser = useStore((state) => state.setUser);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await loginUser(data.username, data.password);

      if (user) {
        setUser(user);
        toast({ title: 'Éxito', description: 'Inicio de sesión correcto.' });
        navigate('/dashboard', { replace: true });
      } else {
        toast({ title: 'Error', description: 'Credenciales inválidas.', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: 'Error', description: 'Ocurrió un error durante el inicio de sesión.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Iniciar Sesión en PACTA</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              type="text"
              placeholder="Tu nombre de usuario"
              {...register('username', { required: 'El nombre de usuario es requerido' })}
              className={errors.username ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              {...register('password', { required: 'La contraseña es requerida' })}
              className={errors.password ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;