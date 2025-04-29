const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Crear roles básicos
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Administrador del sistema',
      permissions: JSON.stringify({
        contracts: ['create', 'read', 'update', 'delete', 'approve'],
        users: ['create', 'read', 'update', 'delete'],
        system: ['configure', 'backup']
      }),
      isSystem: true,
    },
  });

  const raRole = await prisma.role.create({
    data: {
      name: 'RA',
      description: 'Responsable de Área',
      permissions: JSON.stringify({
        contracts: ['create', 'read', 'update'],
        users: ['read'],
        system: ['read']
      }),
      isSystem: true,
    },
  });

  // Crear usuarios iniciales
  const adminPassword = await hash('admin123', 10);
  const raPassword = await hash('ra123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@pacta.com',
      password: adminPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  const raUser = await prisma.user.create({
    data: {
      name: 'Responsable',
      email: 'ra@pacta.com',
      password: raPassword,
      roleId: raRole.id,
      isActive: true,
    },
  });

  // Crear contratos de ejemplo
  const contracts = await Promise.all([
    prisma.contract.create({
      data: {
        contractNumber: 'CONT-2025-001',
        signDate: new Date('2024-12-15'),
        signPlace: 'Ciudad Principal',
        
        // Identificación de las Partes
        type: 'Cliente',
        companyName: 'Empresa A',
        companyAddress: 'Calle Principal 123',
        nationality: 'Cubana',
        commercialAuth: 'MN-2024-001',
        
        // Detalles bancarios
        bankAccount: '1234567890',
        bankBranch: 'Sucursal Central',
        bankAgency: 'Agencia Principal',
        bankHolder: 'Empresa A S.A.',
        bankCurrency: 'CUP',
        
        // Códigos de identificación
        reeupCode: 'REEUP-001-2024',
        nit: 'NIT-001-2024',
        contactPhones: JSON.stringify(['555-0001', '555-0002']),
        
        // Representante legal
        repName: 'Juan Pérez',
        repPosition: 'Director General',
        repDocumentType: 'Resolución',
        repDocumentNumber: 'RES-2024-001',
        repDocumentDate: new Date('2024-01-01'),
        
        // Objeto y obligaciones
        description: 'Servicios de mantenimiento de infraestructura',
        providerObligations: JSON.stringify([
          'Mantener la infraestructura en óptimas condiciones',
          'Realizar mantenimientos preventivos mensuales'
        ]),
        clientObligations: JSON.stringify([
          'Permitir acceso al personal autorizado',
          'Realizar pagos en tiempo y forma'
        ]),
        
        // Entrega y condiciones
        deliveryPlace: 'Sede Principal Cliente',
        deliveryTerm: '5 días hábiles',
        acceptanceProcedure: 'Firma de acta de conformidad',
        
        // Condiciones económicas
        value: 50000,
        currency: 'MN',
        paymentMethod: 'Transferencia',
        paymentTerm: '30 días',
        
        // Garantía y calidad
        warrantyTerm: '12 meses',
        warrantyScope: 'Cobertura total de piezas y mano de obra',
        technicalStandards: 'ISO 9001:2015',
        
        // Reclamaciones y conflictos
        claimProcedure: 'Por escrito dentro de los 5 días hábiles',
        disputeResolution: 'Mediación y arbitraje según legislación vigente',
        
        // Penalidades
        latePaymentInterest: '1% mensual sobre monto adeudado',
        breachPenalties: '10% del valor total del contrato',
        
        // Avisos
        notificationMethods: JSON.stringify(['Correo electrónico', 'Carta certificada']),
        minimumNoticeTime: '30 días calendario',
        
        // Duración
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        extensionTerms: 'Renovación automática por períodos iguales',
        earlyTerminationNotice: '60 días previo a terminación',
        
        // Fuerza mayor
        forceMajeure: 'Eventos naturales, guerra, pandemia',
        
        // Metadatos del sistema
        status: 'Vigente',
        isRestricted: false,
        createdById: adminUser.id,
        ownerId: raUser.id,
      },
    }),
    prisma.contract.create({
      data: {
        contractNumber: 'CONT-2025-002',
        signDate: new Date('2024-12-20'),
        signPlace: 'Ciudad Secundaria',
        
        // Identificación de las Partes
        type: 'Proveedor',
        companyName: 'Empresa B',
        companyAddress: 'Avenida Secundaria 456',
        nationality: 'Cubana',
        commercialAuth: 'MN-2024-002',
        
        // Detalles bancarios
        bankAccount: '0987654321',
        bankBranch: 'Sucursal Norte',
        bankAgency: 'Agencia Comercial',
        bankHolder: 'Empresa B S.A.',
        bankCurrency: 'MLC',
        
        // Códigos de identificación
        reeupCode: 'REEUP-002-2024',
        nit: 'NIT-002-2024',
        contactPhones: JSON.stringify(['555-1001', '555-1002']),
        
        // Representante legal
        repName: 'María Rodríguez',
        repPosition: 'Gerente General',
        repDocumentType: 'Poder Notarial',
        repDocumentNumber: 'POD-2024-001',
        repDocumentDate: new Date('2024-01-15'),
        
        // Objeto y obligaciones
        description: 'Suministro de materiales de oficina',
        providerObligations: JSON.stringify([
          'Entregar materiales según especificaciones',
          'Mantener stock mínimo disponible'
        ]),
        clientObligations: JSON.stringify([
          'Realizar pedidos con anticipación',
          'Efectuar pagos según cronograma'
        ]),
        
        // Entrega y condiciones
        deliveryPlace: 'Almacén Central',
        deliveryTerm: '3 días hábiles',
        acceptanceProcedure: 'Verificación en recepción',
        
        // Condiciones económicas
        value: 25000,
        currency: 'MLC',
        paymentMethod: 'Transferencia',
        paymentTerm: '15 días',
        
        // Garantía y calidad
        warrantyTerm: '6 meses',
        warrantyScope: 'Reemplazo de productos defectuosos',
        technicalStandards: 'Normas de calidad ISO',
        
        // Reclamaciones y conflictos
        claimProcedure: 'Notificación inmediata al detectar defectos',
        disputeResolution: 'Negociación directa y arbitraje',
        
        // Penalidades
        latePaymentInterest: '2% mensual',
        breachPenalties: '15% del valor del pedido',
        
        // Avisos
        notificationMethods: JSON.stringify(['Correo electrónico', 'Teléfono']),
        minimumNoticeTime: '15 días calendario',
        
        // Duración
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-07-31'),
        extensionTerms: 'Prórroga por acuerdo mutuo',
        earlyTerminationNotice: '30 días de anticipación',
        
        // Fuerza mayor
        forceMajeure: 'Desastres naturales, huelgas, restricciones gubernamentales',
        
        // Metadatos del sistema
        status: 'Vigente',
        isRestricted: false,
        createdById: adminUser.id,
        ownerId: raUser.id,
      },
    }),
  ]);

  // Crear suplementos de ejemplo
  await prisma.supplement.create({
    data: {
      contractId: contracts[0].id,
      title: 'Modificación de Monto',
      description: 'Incremento del monto del contrato',
      changes: JSON.stringify({
        field: 'amount',
        oldValue: 50000,
        newValue: 60000,
      }),
      effectiveDate: new Date('2025-06-01'),
      isApproved: true,
      approvedById: adminUser.id,
      approvedAt: new Date(),
      createdById: raUser.id,
    },
  });

  // Crear preferencias de usuario
  await Promise.all([
    prisma.userPreference.create({
      data: {
        userId: adminUser.id,
        theme: 'light',
        notificationsEnabled: true,
        notificationDays: 30,
      },
    }),
    prisma.userPreference.create({
      data: {
        userId: raUser.id,
        theme: 'light',
        notificationsEnabled: true,
        notificationDays: 30,
      },
    }),
  ]);

  // Crear configuración del sistema
  await prisma.systemSetting.create({
    data: {
      key: 'backup_retention_days',
      value: '7',
      category: 'backup',
    },
  });

  console.log('Datos de prueba creados exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 