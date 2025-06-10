import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserForm } from './UserForm';
import { IconUserPlus } from '@tabler/icons-react';

export function AddUserModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    // Aquí podrías agregar un toast de éxito o actualizar la lista de usuarios
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconUserPlus className="w-4 h-4 mr-2" />
          Agregar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <UserForm 
            onSubmit={async (data) => {
              // Aquí iría la lógica para guardar el usuario
              console.log('Datos del usuario:', data);
              // Simulamos una llamada a la API
              await new Promise(resolve => setTimeout(resolve, 1000));
              handleSuccess();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
