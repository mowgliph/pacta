import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '../hooks/useUsers';

export function UserDetails({ userId }) {
  const { data: user, isLoading } = useUser(userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contenido detallado */}
      </CardContent>
    </Card>
  );
}