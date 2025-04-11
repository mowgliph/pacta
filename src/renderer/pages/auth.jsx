import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@/utils/validation/schemas';
import { toast } from '@/renderer/hooks/use-toast';
import { useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { loginUser } from '@/renderer/api/electronAPI';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';
import { LoadingSpinner } from "@/renderer/components/ui/loading-spinner";

const Auth = () => {
  const [, navigate] = useLocation();
  const setUserAndToken = useStore((state) => state.setUserAndToken);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(AuthSchema)
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await loginUser(data.username, data.password);

      if (result && result.token) {
        setUserAndToken(result.user || null, result.token);
        toast({ title: 'Éxito', description: 'Inicio de sesión correcto.' });
        navigate('/dashboard', { replace: true });
      } else {
        const errorMessage = result?.message || 'Credenciales inválidas.';
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: 'Error', description: 'Ocurrió un error durante el inicio de sesión.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gray-100"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md"
      >
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
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center"
              >
                <LoadingSpinner size="small" className="mr-2" />
                Iniciando sesión...
              </motion.div>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Auth;