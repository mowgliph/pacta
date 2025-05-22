import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Esquema de validación con Zod
const userFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Por favor ingresa un correo electrónico válido' }),
  role: z.enum(['admin', 'ra'], {
    required_error: 'Debes seleccionar un rol',
  }),
  isActive: z.boolean().default(true),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>;
  isSubmitting?: boolean;
  onSubmit: (data: UserFormValues) => void;
  isEditMode?: boolean;
}

export function UserForm({ defaultValues, isSubmitting = false, onSubmit, isEditMode = false }: UserFormProps) {
  const navigate = useNavigate();
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input 
              id="name" 
              placeholder="Ej: Juan Pérez" 
              {...form.register('name')} 
              error={form.formState.errors.name?.message}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="ejemplo@dominio.com" 
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select 
              onValueChange={(value) => form.setValue('role', value as 'admin' | 'ra')} 
              defaultValue={form.watch('role')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="ra">Responsable de Área</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm font-medium text-red-500">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Estado</Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={form.watch('isActive')} 
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
              <Label htmlFor="isActive">
                {form.watch('isActive') ? 'Activo' : 'Inactivo'}
              </Label>
            </div>
          </div>

          {!isEditMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••" 
                  {...form.register('password')}
                  error={form.formState.errors.password?.message}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••" 
                  {...form.register('confirmPassword')}
                  error={form.formState.errors.confirmPassword?.message}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-azul-medio hover:bg-azul-oscuro"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
