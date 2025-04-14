import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { contractService, statisticsService } from '@/renderer/services';
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { HoverGlow } from '@/renderer/components/ui/micro-interactions';
import { toast } from '@/renderer/hooks/use-toast';
import useStore from '@/renderer/store/useStore';

interface ProfileData {
  name: string;
  email: string;
  role: string;
}

interface StatsData {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
}

const UserProfile: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, updateUser } = useStore();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    role: ''
  });
  const [stats, setStats] = useState<StatsData>({
    totalContracts: 0,
    activeContracts: 0,
    expiringContracts: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        role: user.role
      });
      loadStats();
    }
  }, [user]);

  const loadStats = async (): Promise<void> => {
    try {
      const statistics = await statisticsService.getGeneralStatistics();
      setStats(statistics);
    } catch (error) {
      console.error("Error loading statistics:", error);
      toast({ 
        title: 'Error', 
        description: 'No se pudieron cargar las estadísticas', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await updateUser(profileData);
      toast({ title: 'Éxito', description: 'Perfil actualizado exitosamente' });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Error al actualizar el perfil', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Input
                id="role"
                name="role"
                value={profileData.role}
                disabled
              />
            </div>
            <div className="flex justify-end">
              <HoverGlow>
                <Button type="submit">
                  Actualizar Perfil
                </Button>
              </HoverGlow>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.totalContracts}</div>
                <div className="text-sm text-gray-500">Total de Contratos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.activeContracts}</div>
                <div className="text-sm text-gray-500">Contratos Activos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.expiringContracts}</div>
                <div className="text-sm text-gray-500">Contratos por Vencer</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;