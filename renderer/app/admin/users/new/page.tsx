'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserForm } from '@/components/admin/UserForm';
import { toast } from '@/components/ui/use-toast';

export default function NewUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      // TODO: Implementar la llamada a la API
      console.log('Datos del formulario:', data);
      
      // Simular una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '¡Éxito!',
        description: 'El usuario ha sido creado correctamente.',
        variant: 'default',
      });
      
      // Redirigir a la lista de usuarios después de crear
      router.push('/admin/users');
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al crear el usuario. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
        <p className="mt-1 text-sm text-gray-500">
          Completa el formulario para agregar un nuevo usuario al sistema.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <UserForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
