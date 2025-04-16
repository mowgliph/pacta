export const mockPublicDashboardData = {
  totalContracts: 358,
  activeContracts: 245,
  expiringContracts: 28,
  contractStats: [
    { month: 'Ene', activos: 220, vencidos: 15, renovados: 25 },
    { month: 'Feb', activos: 228, vencidos: 12, renovados: 22 },
    { month: 'Mar', activos: 235, vencidos: 18, renovados: 30 },
    { month: 'Abr', activos: 245, vencidos: 14, renovados: 28 },
    { month: 'May', activos: 242, vencidos: 16, renovados: 26 },
    { month: 'Jun', activos: 238, vencidos: 20, renovados: 32 }
  ],
  tiposContrato: [
    { tipo: 'Servicios', cantidad: 145, porcentaje: 40 },
    { tipo: 'Productos', cantidad: 98, porcentaje: 27 },
    { tipo: 'Consultoría', cantidad: 65, porcentaje: 18 },
    { tipo: 'Mantenimiento', cantidad: 50, porcentaje: 15 }
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

export const mockDemoContracts = [
  {
    id: 'demo1',
    name: 'Servicios Cloud AWS',
    type: 'Servicios',
    status: 'Activo',
    startDate: '2025-01-15',
    endDate: '2026-01-15',
    value: 125000
  },
  {
    id: 'demo2',
    name: 'Consultoría Transformación Digital',
    type: 'Consultoría',
    status: 'Activo',
    startDate: '2025-02-01',
    endDate: '2025-08-01',
    value: 85000
  },
  {
    id: 'demo3',
    name: 'Licencias Microsoft 365',
    type: 'Productos',
    status: 'Próximo a vencer',
    startDate: '2024-06-15',
    endDate: '2025-06-15',
    value: 45000
  },
  {
    id: 'demo4',
    name: 'Mantenimiento Infraestructura',
    type: 'Mantenimiento',
    status: 'Activo',
    startDate: '2025-03-01',
    endDate: '2026-03-01',
    value: 95000
  }
];