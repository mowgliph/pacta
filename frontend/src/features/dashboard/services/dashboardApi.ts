import axios from 'axios';

// Tipos para las estadísticas del dashboard
export interface DashboardStats {
  activeContracts: number;
  pendingRenewals: number;
  totalUsers: number;
  alerts: number;
  contractsStats: {
    labels: string[];
    data: number[];
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
  upcomingContracts: Array<{
    id: string;
    contractNumber: string;
    company: string;
    type: string;
    daysUntilExpiry: number;
  }>;
}

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene las estadísticas del dashboard
 * @returns Promesa con las estadísticas del dashboard
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await axios.get(`${API_URL}/statistics/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    
    // Devolver datos de muestra en caso de error
    return {
      activeContracts: 14,
      pendingRenewals: 3,
      totalUsers: 28,
      alerts: 2,
      contractsStats: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [12, 19, 8, 15, 22, 14]
      },
      recentActivity: [
        {
          id: '1',
          type: 'update',
          description: 'Contrato #1005 actualizado',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '2',
          type: 'new',
          description: 'Usuario nuevo registrado',
          createdAt: new Date(Date.now() - 18000000).toISOString()
        },
        {
          id: '3',
          type: 'renewal',
          description: 'Renovación de contrato programada',
          createdAt: new Date(Date.now() - 43200000).toISOString()
        },
        {
          id: '4',
          type: 'alert',
          description: 'Alerta de contrato resuelta',
          createdAt: new Date(Date.now() - 64800000).toISOString()
        },
        {
          id: '5',
          type: 'document',
          description: 'Documento cargado al sistema',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      upcomingContracts: [
        {
          id: '1',
          contractNumber: '1005',
          company: 'Cliente A',
          type: 'Servicios',
          daysUntilExpiry: 5
        },
        {
          id: '2',
          contractNumber: '1002',
          company: 'Cliente B',
          type: 'Mantenimiento',
          daysUntilExpiry: 14
        },
        {
          id: '3',
          contractNumber: '1008',
          company: 'Cliente C',
          type: 'Licencias',
          daysUntilExpiry: 30
        }
      ]
    };
  }
}; 