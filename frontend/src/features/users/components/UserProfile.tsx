import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconEdit, IconMail, IconPhone, IconBriefcase } from "@tabler/icons-react";

type UserProfileProps = {
  className?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    phone?: string;
    department?: string;
  };
}

export function UserProfile({ className, user }: UserProfileProps) {
  // Si no hay usuario, mostrar datos de ejemplo
  const userData = user || {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    avatar: '/avatars/user1.png',
    role: 'Administrador',
    phone: '+34 612 345 678',
    department: 'Tecnología'
  };

  const initials = userData.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className={className}>
      <CardHeader className="relative pb-0">
        <div className="absolute right-4 top-4">
          <Button size="icon" variant="ghost">
            <IconEdit className="h-4 w-4" />
            <span className="sr-only">Editar perfil</span>
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-xl">{userData.name}</CardTitle>
          <div className="text-sm text-muted-foreground">{userData.role}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <IconMail className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{userData.email}</span>
          </div>
          {userData.phone && (
            <div className="flex items-center">
              <IconPhone className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.phone}</span>
            </div>
          )}
          {userData.department && (
            <div className="flex items-center">
              <IconBriefcase className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.department}</span>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline">Cambiar contraseña</Button>
          <Button>Actualizar perfil</Button>
        </div>
      </CardContent>
    </Card>
  );
} 