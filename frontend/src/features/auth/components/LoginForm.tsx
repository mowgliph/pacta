import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, UserIcon, KeyIcon } from 'lucide-react';

// Esquema de validación
const loginSchema = z.object({
  username: z.string().min(3, { 
    message: 'El nombre de usuario debe tener al menos 3 caracteres' 
  }),
  password: z.string().min(6, { 
    message: 'La contraseña debe tener al menos 6 caracteres' 
  }),
  recordarme: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Props para el componente
export type LoginFormProps = {
  onSubmit: (username: string, password: string, recordarme: boolean) => Promise<void>;
  cargando: boolean;
}

export function LoginForm({ onSubmit, cargando }: LoginFormProps) {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  // Inicializar formulario
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      recordarme: false,
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    await onSubmit(values.username, values.password, values.recordarme);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input 
                    placeholder="Nombre de usuario" 
                    className="pl-10" 
                    {...field} 
                    disabled={cargando}
                    autoComplete="username"
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
                <KeyIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input 
                    type={mostrarPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="pl-10 pr-10" 
                    {...field} 
                    disabled={cargando}
                    autoComplete="current-password"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  disabled={cargando}
                >
                  {mostrarPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="recordarme"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={cargando}
                  id="recordarme"
                />
              </FormControl>
              <div className="space-y-0.5 leading-none">
                <FormLabel
                  htmlFor="recordarme"
                  className="text-sm font-medium cursor-pointer"
                >
                  Recordarme
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full mt-6"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Iniciando sesión...
            </>
          ) : 'Iniciar sesión'}
        </Button>
      </form>
    </Form>
  );
} 