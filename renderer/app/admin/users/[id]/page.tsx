'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserForm } from '@/components/admin/UserForm';
import { toast } from '@/components/ui/use-toast';

// Tipo para los datos del usuario
type UserData = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'ra';
  isActive: boolean;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Cargar los datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // TODO: Implementar la llamada a la API para obtener los datos del usuario
        // Simulamos una llamada a la API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Datos de ejemplo - en una aplicación real, esto vendría de tu API
        const mockUserData: UserData = {
          id: userId,
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'admin',
          isActive: true,
        };
        
        setUserData(mockUserData);
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos del usuario.',
          variant: 'destructive',
        });
        router.push('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, router]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      // TODO: Implementar la llamada a la API para actualizar el usuario
      console.log('Datos actualizados:', { ...data, id: userId });
      
      // Simular una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '¡Éxito!',
        description: 'Los datos del usuario han sido actualizados correctamente.',
        variant: 'default',
      });
      
      // Redirigir a la lista de usuarios después de actualizar
      router.push('/admin/users');
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al actualizar el usuario. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-medio"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontró el usuario solicitado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
        <p className="mt-1 text-sm text-gray-500">
          Modifica la información del usuario seleccionado.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <UserForm 
          defaultValues={{
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isActive: userData.isActive,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditMode={true}
        />
      </div>
    </div>
  );
}
