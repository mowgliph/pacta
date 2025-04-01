import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useStore } from '@/store'; // Importar el store de Zustand
import { useNavigate } from '@tanstack/react-router'; // Importar hook de navegación
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAt, IconEyeOff, IconEye, IconKey, IconAlertTriangle } from '@tabler/icons-react';

// Esquema de validación con Zod
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria.' }),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useStore(
    (state) => ({ 
      login: state.login, 
      isLoading: state.isLoading, 
      error: state.error 
    })
  );
  
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const success = await login(values.email, values.password, values.rememberMe);
    if (success) {
      navigate({ to: '/_authenticated' }); // Redirigir al área autenticada
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Mostrar error general del login */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-5 duration-300">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de Autenticación</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <div className="relative">
                <IconAt className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="tu@correo.com" 
                    className="pl-10" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <div className="relative">
                <IconKey className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="********" 
                    className="pl-10 pr-10" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <div className="flex items-center space-x-2 pt-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  id="rememberMe"
                />
              </FormControl>
              <div className="space-y-0.5 leading-none">
                <FormLabel
                  htmlFor="rememberMe"
                  className="text-sm font-medium cursor-pointer"
                >
                  Mantener sesión iniciada
                </FormLabel>
              </div>
            </div>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full mt-6 transition-all hover:shadow-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Iniciando sesión...
            </>
          ) : 'Iniciar Sesión'}
        </Button>
      </form>
    </Form>
  );
}; 