import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserProfile } from '../components/UserProfile';
import { useStore } from '@/store';

/**
 * Página de perfil de usuario que muestra la información del usuario actual
 */
export default function UserProfilePage() {
  const { user } = useStore();
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Perfil"
        description="Información de tu cuenta"
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-3">
          <UserProfile 
            user={user ? {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email || '',
              role: user.role,
              avatar: user.avatar
            } : undefined}
          />
        </div>
      </div>
    </div>
  );
} 