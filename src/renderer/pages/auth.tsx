import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@/renderer/utils/validation/schemas';
import { toast } from '@/renderer/hooks/use-toast';
import { useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { electronAPI } from '@/renderer/api/electronAPI';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/renderer/components/ui/card";
import { Skeleton } from '@/renderer/components/ui/skeleton';
import { HoverScale, HoverBounce, HoverGlow, HoverBackground } from '@/renderer/components/ui/micro-interactions';
import { Switch } from '@/renderer/components/ui/switch';
import { Label } from '@/renderer/components/ui/label';
import { Input } from '@/renderer/components/ui/input';
import { Button } from '@/renderer/components/ui/button';

interface FormInputs {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
  message?: string;
}

const Auth: React.FC = () => {
  const [, navigate] = useLocation();
  const setUserAndToken = useStore((state) => state.setUserAndToken);
  const { 
    register, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<FormInputs>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      rememberMe: false
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  
  // Check for saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('pacta_username');
    if (savedUsername) {
      setValue('username', savedUsername);
      setValue('rememberMe', true);
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit = async (data: FormInputs): Promise<void> => {
    setIsLoading(true);
    try {
      const result: LoginResponse = await electronAPI.auth.login({
        username: data.username,
        password: data.password
      });

      if (result && result.token && result.user) {
        // Guardar credenciales si se seleccionó "recordar sesión"
        if (data.rememberMe) {
          localStorage.setItem('pacta_username', data.username);
          // Establecer tiempo de expiración (4 horas)
          const expirationTime = new Date().getTime() + (4 * 60 * 60 * 1000);
          localStorage.setItem('pacta_session_expiry', expirationTime.toString());
        } else {
          // Limpiar datos guardados si no se selecciona recordar
          localStorage.removeItem('pacta_username');
          localStorage.removeItem('pacta_session_expiry');
        }
        
        setUserAndToken(result.user, result.token);
        toast({ title: 'Éxito', description: 'Inicio de sesión correcto.' });
        navigate('/dashboard', { replace: true });
      } else {
        const errorMessage = result?.message || 'Credenciales inválidas.';
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ 
        title: 'Error', 
        description: 'Ocurrió un error durante el inicio de sesión.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
        <Card className="w-full max-w-md shadow-lg border-opacity-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Iniciar Sesión</CardTitle>
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
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-md p-8">
        <HoverScale>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">PACTA</h1>
            <p className="text-muted-foreground mt-2">Gestión de Contratos</p>
          </div>
        </HoverScale>

        <HoverGlow>
          <Card className="shadow-lg border-opacity-50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Iniciar sesión</CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Nombre de Usuario
                    </Label>
                    <Input
                      id="username"
                      {...register("username")}
                      type="text"
                      autoComplete="username"
                      required
                      className="h-10 transition-all duration-200 focus:border-primary"
                      placeholder="usuario123"
                      aria-required="true"
                      aria-describedby="username-error"
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600" id="username-error" role="alert">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      {...register("password")}
                      type="password"
                      autoComplete="current-password"
                      required
                      className="h-10 transition-all duration-200 focus:border-primary"
                      placeholder="••••••••"
                      aria-required="true"
                      aria-describedby="password-error"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600" id="password-error" role="alert">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="remember-me" 
                    {...register("rememberMe")} 
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean) => {
                      setRememberMe(checked);
                      setValue("rememberMe", checked);
                    }}
                  />
                  <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                    Recordar mi sesión por 4 horas
                  </Label>
                </div>

                <div className="pt-2">
                  <HoverBounce>
                    <Button
                      type="submit"
                      className="w-full h-11 font-medium transition-all duration-200"
                      aria-label="Iniciar sesión"
                    >
                      Iniciar Sesión
                    </Button>
                  </HoverBounce>
                </div>
              </form>
            </CardContent>
          </Card>
        </HoverGlow>
      </div>
    </div>
  );
};

export default Auth;