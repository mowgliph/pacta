import { type SpecificStats, type UserMetrics } from '../../dashboard/services/dashboard-service';

/**
 * Genera datos mock para las estadísticas de contratos
 */
export const mockContractStats = (): SpecificStats => {
  return {
    byStatus: {
      'ACTIVE': 42,
      'PENDING': 12,
      'EXPIRED': 8,
      'DRAFT': 5,
      'CANCELED': 3,
    },
    byType: {
      'Servicios': 28,
      'Licencias': 16,
      'Proveedores': 14,
      'Mantenimiento': 8,
      'Arrendamiento': 4,
    },
    byMonth: [
      { month: 'Enero', count: 5 },
      { month: 'Febrero', count: 7 },
      { month: 'Marzo', count: 12 },
      { month: 'Abril', count: 8 },
      { month: 'Mayo', count: 14 },
      { month: 'Junio', count: 10 },
      { month: 'Julio', count: 9 },
      { month: 'Agosto', count: 11 },
      { month: 'Septiembre', count: 15 },
      { month: 'Octubre', count: 12 },
      { month: 'Noviembre', count: 8 },
      { month: 'Diciembre', count: 6 },
    ],
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Genera datos mock para las estadísticas de usuarios
 */
export const mockUserStats = (): SpecificStats => {
  return {
    byRole: {
      'admin': 3,
      'manager': 8,
      'user': 45,
      'client': 22,
      'guest': 5,
    },
    active: 68,
    inactive: 15,
    byMonth: [
      { month: 'Enero', count: 2 },
      { month: 'Febrero', count: 4 },
      { month: 'Marzo', count: 5 },
      { month: 'Abril', count: 3 },
      { month: 'Mayo', count: 6 },
      { month: 'Junio', count: 8 },
      { month: 'Julio', count: 4 },
      { month: 'Agosto', count: 5 },
      { month: 'Septiembre', count: 7 },
      { month: 'Octubre', count: 5 },
      { month: 'Noviembre', count: 3 },
      { month: 'Diciembre', count: 2 },
    ],
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Genera datos mock para las estadísticas de actividad
 */
export const mockActivityStats = (): SpecificStats => {
  return {
    byType: {
      'contract_created': 35,
      'contract_updated': 86,
      'user_login': 192,
      'document_upload': 45,
      'payment_processed': 27,
    },
    byDate: [
      { date: '2023-01-01', count: 8 },
      { date: '2023-01-02', count: 12 },
      { date: '2023-01-03', count: 15 },
      { date: '2023-01-04', count: 10 },
      { date: '2023-01-05', count: 7 },
      { date: '2023-01-06', count: 5 },
      { date: '2023-01-07', count: 9 },
      { date: '2023-01-08', count: 14 },
      { date: '2023-01-09', count: 18 },
      { date: '2023-01-10', count: 12 },
    ],
    byUser: {
      'user1': 45,
      'user2': 28,
      'user3': 65,
      'user4': 32,
    },
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Genera datos mock para las métricas de usuario
 */
export const mockUserMetrics = (): UserMetrics => {
  return {
    contractsCreated: 12,
    contractsUpdated: 28,
    documentsUploaded: 45,
    lastActivity: new Date().toISOString(),
  };
};

/**
 * Mock service para estadísticas
 * Útil para desarrollo mientras se completa la implementación del backend
 */
export const StatisticsMockService = {
  getSpecificStats: (type: string): SpecificStats => {
    // Datos comunes para todas las estadísticas
    const baseStats: SpecificStats = {
      lastUpdated: new Date().toISOString(),
    };

    // Utilidades para generar datos aleatorios
    const generateMonthlyData = (range: number = 12, min: number = 5, max: number = 30) => {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      
      const currentMonth = new Date().getMonth();
      
      return Array.from({ length: range }, (_, i) => {
        const monthIndex = (currentMonth - i + 12) % 12;
        return {
          month: months[monthIndex],
          count: Math.floor(Math.random() * (max - min + 1)) + min
        };
      }).reverse();
    };
    
    const generateTypeData = (types: string[]) => {
      return types.reduce((acc, type) => {
        acc[type] = Math.floor(Math.random() * 50) + 5;
        return acc;
      }, {} as Record<string, number>);
    };

    // Datos específicos según el tipo de estadística
    switch (type) {
      case 'contract':
        return {
          ...baseStats,
          byStatus: {
            ACTIVE: 45,
            PENDING: 12,
            EXPIRED: 8,
            DRAFT: 15,
            CANCELED: 5
          },
          byType: {
            servicio: 35,
            producto: 25,
            obra: 15,
            mixto: 10
          },
          byMonth: generateMonthlyData()
        };
        
      case 'user':
        return {
          ...baseStats,
          byRole: {
            admin: 3,
            manager: 7,
            user: 25,
            client: 18,
            guest: 5
          },
          active: 42,
          inactive: 16,
          byMonth: generateMonthlyData()
        };
        
      case 'activity':
        return {
          ...baseStats,
          byDate: Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
              date: date.toISOString().split('T')[0],
              count: Math.floor(Math.random() * 15) + 1
            };
          }),
          byType: {
            contract_created: 24,
            contract_updated: 35,
            user_login: 120,
            document_upload: 45,
            payment_processed: 18
          },
          byUser: {
            'Juan Pérez': 25,
            'María González': 18,
            'Carlos Rodríguez': 30,
            'Ana Martínez': 15,
            'Luis Sánchez': 20
          }
        };
        
      case 'company':
        return {
          ...baseStats,
          byCompany: {
            'Empresa A': 12,
            'Empresa B': 8,
            'Empresa C': 15,
            'Empresa D': 6,
            'Empresa E': 10,
            'Empresa F': 7,
            'Empresa G': 4
          },
          byCompanyType: {
            cliente: 25,
            proveedor: 18,
            ambos: 10,
            potencial: 5,
            inactivo: 3
          },
          companiesPerMonth: generateMonthlyData()
        };

      case 'client-contract':
        return {
          ...baseStats,
          byStatus: {
            ACTIVE: 28,
            PENDING: 8,
            EXPIRED: 6,
            DRAFT: 10,
            CANCELED: 3
          },
          byClientContract: {
            servicio: 20,
            producto: 15,
            continuo: 8,
            temporal: 12
          },
          byMonth: generateMonthlyData()
        };

      case 'provider-contract':
        return {
          ...baseStats,
          byStatus: {
            ACTIVE: 22,
            PENDING: 5,
            EXPIRED: 3,
            DRAFT: 7,
            CANCELED: 2
          },
          byProviderContract: {
            material: 12,
            servicio: 18,
            equipamiento: 5,
            mantenimiento: 4
          },
          byMonth: generateMonthlyData()
        };

      case 'expired-contract':
        return {
          ...baseStats,
          expiredContracts: generateMonthlyData(),
          expiredByType: {
            cliente: 15,
            proveedor: 12,
            servicio: 8,
            producto: 5,
            obra: 3
          },
          byStatus: {
            "Total": 43
          }
        };

      case 'supplement-contract':
        return {
          ...baseStats,
          withSupplements: 25,
          withoutSupplements: 55,
          supplementsByMonth: generateMonthlyData(),
          supplementsByType: {
            precio: 12,
            plazo: 15,
            servicio: 8,
            alcance: 5,
            otro: 3
          }
        };

      case 'new-contract':
        return {
          ...baseStats,
          newContractsByMonth: generateMonthlyData(),
          newContractsByType: {
            cliente: 18,
            proveedor: 15,
            servicio: 22,
            producto: 10,
            obra: 5
          },
          newContractsTrend: Array.from({ length: 24 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return {
              year: date.getFullYear(),
              month: [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
              ][date.getMonth()],
              count: Math.floor(Math.random() * 25) + 5
            };
          })
        };
        
      default:
        return baseStats;
    }
  },
}; 