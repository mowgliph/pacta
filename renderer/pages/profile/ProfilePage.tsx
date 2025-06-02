import { useState, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { IconLoader2, IconDeviceFloppy, IconUser, IconMail, IconKey, IconPhone, IconBuilding } from '@tabler/icons-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Cargar datos del usuario cuando esté disponible
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsLoading(false);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    // Validar contraseñas solo si se está intentando cambiar
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'La contraseña actual es requerida';
      }
      
      if (formData.newPassword) {
        if (formData.newPassword.length < 8) {
          errors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
        } else if (formData.newPassword !== formData.confirmPassword) {
          errors.confirmPassword = 'Las contraseñas no coinciden';
        }
      } else if (formData.confirmPassword) {
        errors.newPassword = 'Debes ingresar una nueva contraseña';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario comienza a escribir
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: {
        name: string;
        phone: string;
        company: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim()
      };

      // Solo incluir campos de contraseña si se están cambiando
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const success = await updateProfile(updateData);

      if (success) {
        toast({
          title: '¡Perfil actualizado!',
          description: 'Tus datos se han actualizado correctamente.',
        });

        // Limpiar campos de contraseña solo si la actualización fue exitosa
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // Limpiar errores
        setFormErrors({});
      }
    } catch (error: any) {
      console.error('Error al actualizar el perfil:', error);
      
      // Mostrar mensaje de error específico si está disponible
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'No se pudo actualizar el perfil. Por favor, verifica los datos e inténtalo de nuevo.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Si hay errores de validación del servidor, mostrarlos en los campos correspondientes
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <IconLoader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Cargando perfil...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block">
          <p>No se pudo cargar la información del perfil.</p>
          <p className="text-sm mt-2">Por favor, recarga la página o intenta iniciar sesión nuevamente.</p>
        </div>
      </div>
    );
  }

  // Función para renderizar mensajes de error bajo los campos
  const renderError = (field: keyof typeof formErrors) => {
    if (!formErrors[field]) return null;
    return (
      <div id={`${field}-error`} className="text-red-500 text-sm mt-1">
        {formErrors[field]}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-2xl bg-[#97CADB] text-[#001B48]">
              {user?.name ? getInitials(user.name) : 'US'}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Administra tu información personal y configuración de cuenta</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Actualiza tu información personal y detalles de contacto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <IconUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`pl-10 ${formErrors.name ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                      aria-invalid={!!formErrors.name}
                      aria-describedby={formErrors.name ? 'name-error' : undefined}
                    />
                    {formErrors.name && (
                      <div id="name-error" className="text-red-500 text-sm mt-1">
                        {formErrors.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-gray-100 text-gray-600"
                      disabled
                      aria-readonly="true"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <IconPhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`pl-10 ${formErrors.phone ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                      aria-invalid={!!formErrors.phone}
                      aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                    />
                  </div>
                  {renderError('phone')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <div className="relative">
                    <IconBuilding className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={`pl-10 ${formErrors.company ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                      aria-invalid={!!formErrors.company}
                      aria-describedby={formErrors.company ? 'company-error' : undefined}
                    />
                  </div>
                  {renderError('company')}
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-4">Cambiar contraseña</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <div className="relative">
                      <IconKey className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={`pl-10 ${formErrors.currentPassword ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        aria-invalid={!!formErrors.currentPassword}
                        aria-describedby={formErrors.currentPassword ? 'currentPassword-error' : undefined}
                      />
                    </div>
                    {renderError('currentPassword')}
                  </div>
                  <div className="opacity-50">
                    <Label>Requisitos</Label>
                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                      <div>• Mínimo 8 caracteres</div>
                      <div>• Al menos un número</div>
                      <div>• Al menos un carácter especial</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <div className="relative">
                      <IconKey className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={`pl-10 ${formErrors.newPassword ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        aria-invalid={!!formErrors.newPassword}
                        aria-describedby={formErrors.newPassword ? 'newPassword-error' : undefined}
                      />
                    </div>
                    {renderError('newPassword')}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                    <div className="relative">
                      <IconKey className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-10 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        aria-invalid={!!formErrors.confirmPassword}
                        aria-describedby={formErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                      />
                    </div>
                    {renderError('confirmPassword')}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
