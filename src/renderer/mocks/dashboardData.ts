export const mockPublicDashboardData = {
  totalContracts: 150,
  activeContracts: 89,
  expiringContracts: 12,
  contractStats: [
    { month: 'Ene', activos: 45, vencidos: 5 },
    { month: 'Feb', activos: 48, vencidos: 3 },
    { month: 'Mar', activos: 52, vencidos: 4 },
    { month: 'Abr', activos: 55, vencidos: 6 },
    { month: 'May', activos: 58, vencidos: 2 },
    { month: 'Jun', activos: 60, vencidos: 3 }
  ]
};

export const mockExpiringContracts = [
  { id: 1, name: 'Contrato Servicios TI', endDate: '2025-05-15' },
  { id: 2, name: 'Contrato Mantenimiento', endDate: '2025-05-20' },
  { id: 3, name: 'Contrato Suministros', endDate: '2025-05-25' },
  { id: 4, name: 'Contrato Consultoría', endDate: '2025-05-30' },
  { id: 5, name: 'Contrato Servicios Cloud', endDate: '2025-06-05' }
];

export const mockRecentSupplements = [
  { 
    id: 1, 
    description: 'Actualización de términos',
    contractId: 1,
    contractName: 'Contrato Servicios TI',
    date: '2025-04-10'
  },
  {
    id: 2,
    description: 'Modificación de alcance',
    contractId: 2,
    contractName: 'Contrato Mantenimiento',
    date: '2025-04-12'
  },
  {
    id: 3,
    description: 'Extensión de plazo',
    contractId: 3,
    contractName: 'Contrato Suministros',
    date: '2025-04-14'
  }
];