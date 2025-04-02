import React from 'react';
import { MetaFunction } from '@remix-run/node';
import { PageHeader } from '../../components/layout/PageHeader';
import { RecentContracts } from '../../features/contracts/components/RecentContracts';

export const meta: MetaFunction = () => {
  return [
    { title: "PACTA - Gestión de Contratos" },
    { name: "description", content: "Gestión y visualización de contratos" },
  ];
};

export default function ContractsPage() {
  return (
    <div className="container py-6 space-y-6">
      <PageHeader 
        title="Contratos" 
        description="Gestión y administración de contratos" 
      />
      
      <RecentContracts />
      
      <div className="p-4 bg-muted rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-2">Estado de la integración con el backend</h3>
        <p>
          Este listado muestra los contratos existentes en el sistema.
          Todos los datos son obtenidos mediante SWR desde el API.
        </p>
        <p className="mt-2">
          Si ves errores de carga, asegúrate de que el servidor backend esté 
          ejecutándose en el puerto correcto y que las rutas de API estén 
          configuradas correctamente.
        </p>
      </div>
    </div>
  );
} 