const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Crear roles básicos
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } })
    || await prisma.role.create({
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

  const raRole = await prisma.role.findUnique({ where: { name: 'RA' } })
    || await prisma.role.create({
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

  // Crear usuarios iniciales solo si no existen
  const adminPassword = await hash('pacta', 10);
  const raPassword = await hash('pacta', 10);

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@pacta.local' } })
    || await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@pacta.local',
        password: adminPassword,
        roleId: adminRole.id,
        isActive: true,
      },
    });

  const raUser = await prisma.user.findUnique({ where: { email: 'ra@pacta.local' } })
    || await prisma.user.create({
      data: {
        name: 'Responsable',
        email: 'ra@pacta.local',
        password: raPassword,
        roleId: raRole.id,
        isActive: true,
      },
    });

  // Crear contratos de ejemplo
  const contract1 = await prisma.contract.findUnique({ where: { contractNumber: 'CONT-2025-001' } })
    || await prisma.contract.create({
      data: {
        contractNumber: 'CONT-2025-001',
        signDate: new Date('2024-12-15'),
        signPlace: 'Ciudad Principal',
        type: 'Cliente',
        companyName: 'Empresa A',
        companyAddress: 'Calle Principal 123',
        nationality: 'Cubana',
        commercialAuth: 'MN-2024-001',
        bankAccount: '1234567890',
        bankBranch: 'Sucursal Central',
        bankAgency: 'Agencia Principal',
        bankHolder: 'Empresa A S.A.',
        bankCurrency: 'CUP',
        reeupCode: 'REEUP-001-2024',
        nit: 'NIT-001-2024',
        contactPhones: JSON.stringify(['555-0001', '555-0002']),
        repName: 'Juan Pérez',
        repPosition: 'Director General',
        repDocumentType: 'Resolución',
        repDocumentNumber: 'RES-2024-001',
        repDocumentDate: new Date('2024-01-01'),
        description: 'Servicios de mantenimiento de infraestructura',
        providerObligations: JSON.stringify([
          'Mantener la infraestructura en óptimas condiciones',
          'Realizar mantenimientos preventivos mensuales'
        ]),
        clientObligations: JSON.stringify([
          'Permitir acceso al personal autorizado',
          'Realizar pagos en tiempo y forma'
        ]),
        deliveryPlace: 'Sede Principal Cliente',
        deliveryTerm: '5 días hábiles',
        acceptanceProcedure: 'Firma de acta de conformidad',
        value: 50000,
        currency: 'MN',
        paymentMethod: 'Transferencia',
        paymentTerm: '30 días',
        warrantyTerm: '12 meses',
        warrantyScope: 'Cobertura total de piezas y mano de obra',
        technicalStandards: 'ISO 9001:2015',
        claimProcedure: 'Por escrito dentro de los 5 días hábiles',
        disputeResolution: 'Mediación y arbitraje según legislación vigente',
        latePaymentInterest: '1% mensual sobre monto adeudado',
        breachPenalties: '10% del valor total del contrato',
        notificationMethods: JSON.stringify(['Correo electrónico', 'Carta certificada']),
        minimumNoticeTime: '30 días calendario',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        extensionTerms: 'Renovación automática por períodos iguales',
        earlyTerminationNotice: '60 días previo a terminación',
        forceMajeure: 'Eventos naturales, guerra, pandemia',
        status: 'Vigente',
        isRestricted: false,
        createdById: adminUser.id,
        ownerId: raUser.id,
      },
    });

  const contract2 = await prisma.contract.findUnique({ where: { contractNumber: 'CONT-2025-002' } })
    || await prisma.contract.create({
      data: {
        contractNumber: 'CONT-2025-002',
        signDate: new Date('2024-12-20'),
        signPlace: 'Ciudad Secundaria',
        type: 'Proveedor',
        companyName: 'Empresa B',
        companyAddress: 'Avenida Secundaria 456',
        nationality: 'Cubana',
        commercialAuth: 'MN-2024-002',
        bankAccount: '0987654321',
        bankBranch: 'Sucursal Norte',
        bankAgency: 'Agencia Comercial',
        bankHolder: 'Empresa B S.A.',
        bankCurrency: 'MLC',
        reeupCode: 'REEUP-002-2024',
        nit: 'NIT-002-2024',
        contactPhones: JSON.stringify(['555-1001', '555-1002']),
        repName: 'María Rodríguez',
        repPosition: 'Gerente General',
        repDocumentType: 'Poder Notarial',
        repDocumentNumber: 'POD-2024-001',
        repDocumentDate: new Date('2024-01-15'),
        description: 'Suministro de materiales de oficina',
        providerObligations: JSON.stringify([
          'Entregar materiales según especificaciones',
          'Mantener stock mínimo disponible'
        ]),
        clientObligations: JSON.stringify([
          'Realizar pedidos con anticipación',
          'Efectuar pagos según cronograma'
        ]),
        deliveryPlace: 'Almacén Central',
        deliveryTerm: '3 días hábiles',
        acceptanceProcedure: 'Verificación en recepción',
        value: 25000,
        currency: 'MLC',
        paymentMethod: 'Transferencia',
        paymentTerm: '15 días',
        warrantyTerm: '6 meses',
        warrantyScope: 'Reemplazo de productos defectuosos',
        technicalStandards: 'Normas de calidad ISO',
        claimProcedure: 'Notificación inmediata al detectar defectos',
        disputeResolution: 'Negociación directa y arbitraje',
        latePaymentInterest: '2% mensual',
        breachPenalties: '15% del valor del pedido',
        notificationMethods: JSON.stringify(['Correo electrónico', 'Teléfono']),
        minimumNoticeTime: '15 días calendario',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-07-31'),
        extensionTerms: 'Prórroga por acuerdo mutuo',
        earlyTerminationNotice: '30 días de anticipación',
        forceMajeure: 'Desastres naturales, huelgas, restricciones gubernamentales',
        status: 'Vigente',
        isRestricted: false,
        createdById: adminUser.id,
        ownerId: raUser.id,
      },
    });

  const contracts = [contract1, contract2];

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
  const adminPref = await prisma.userPreference.findUnique({ where: { userId: adminUser.id } })
    || await prisma.userPreference.create({
      data: {
        userId: adminUser.id,
        theme: 'light',
        notificationsEnabled: true,
        notificationDays: 30,
      },
    });

  const raPref = await prisma.userPreference.findUnique({ where: { userId: raUser.id } })
    || await prisma.userPreference.create({
      data: {
        userId: raUser.id,
        theme: 'light',
        notificationsEnabled: true,
        notificationDays: 30,
      },
    });

  // Crear configuración del sistema
  const backupSetting = await prisma.systemSetting.findUnique({ where: { key: 'backup_retention_days' } })
    || await prisma.systemSetting.create({
      data: {
        key: 'backup_retention_days',
        value: '7',
        category: 'backup',
      },
    });

  // Usuario desactivado
  const inactiveUser = await prisma.user.findUnique({ where: { email: 'inactivo@pacta.local' } })
    || await prisma.user.create({
      data: {
        name: 'Usuario Inactivo',
        email: 'inactivo@pacta.local',
        password: await hash('pacta', 10),
        roleId: raRole.id,
        isActive: false,
      },
    });

  // Contrato Vencido
  const expiredContract = await prisma.contract.findUnique({ where: { contractNumber: 'CONT-2024-003' } })
    || await prisma.contract.create({
      data: {
        contractNumber: 'CONT-2024-003',
        type: 'Cliente',
        companyName: 'Empresa C',
        companyAddress: 'Dirección de Empresa C',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        signDate: new Date('2023-01-01'),
        signPlace: 'Ciudad Ejemplo',
        value: 10000,
        currency: 'USD',
        paymentMethod: 'Efectivo',
        status: 'Vencido',
        createdById: adminUser.id,
        ownerId: raUser.id,
        description: 'Contrato vencido de prueba',
      },
    });

  // Contrato Próximo a Vencer
  const soonExpiringContract = await prisma.contract.findUnique({ where: { contractNumber: 'CONT-2024-004' } })
    || await prisma.contract.create({
      data: {
        contractNumber: 'CONT-2024-004',
        type: 'Proveedor',
        companyName: 'Empresa D',
        companyAddress: 'Dirección de Empresa D',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        signDate: new Date(),
        signPlace: 'Ciudad Ejemplo',
        value: 20000,
        currency: 'EUR',
        paymentMethod: 'Cheque',
        status: 'Próximo a Vencer',
        createdById: adminUser.id,
        ownerId: raUser.id,
        description: 'Contrato próximo a vencer',
      },
    });

  // Contrato Archivado
  const archivedContract = await prisma.contract.findUnique({ where: { contractNumber: 'CONT-2024-005' } })
    || await prisma.contract.create({
      data: {
        contractNumber: 'CONT-2024-005',
        type: 'Cliente',
        companyName: 'Empresa E',
        companyAddress: 'Dirección de Empresa E',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-12-31'),
        signDate: new Date('2022-01-01'),
        signPlace: 'Ciudad Ejemplo',
        value: 15000,
        currency: 'USD',
        paymentMethod: 'Transferencia',
        status: 'Archivado',
        createdById: adminUser.id,
        ownerId: inactiveUser.id,
        description: 'Contrato archivado de prueba',
      },
    });

  // Más suplementos con diferentes campos
  await prisma.supplement.createMany({
    data: [
      {
        contractId: expiredContract.id,
        title: 'Cambio de Fecha Fin',
        description: 'Se extendió la fecha de fin',
        changes: JSON.stringify({ field: 'endDate', oldValue: '2023-12-31', newValue: '2024-06-30' }),
        effectiveDate: new Date('2024-01-01'),
        isApproved: true,
        approvedById: adminUser.id,
        approvedAt: new Date(),
        createdById: raUser.id,
      },
      {
        contractId: soonExpiringContract.id,
        title: 'Cambio de Descripción',
        description: 'Actualización de objeto del contrato',
        changes: JSON.stringify({ field: 'description', oldValue: 'Contrato próximo a vencer', newValue: 'Contrato actualizado' }),
        effectiveDate: new Date(),
        isApproved: false,
        createdById: raUser.id,
      },
      {
        contractId: archivedContract.id,
        title: 'Cambio de Monto',
        description: 'Reducción del monto',
        changes: JSON.stringify({ field: 'value', oldValue: 15000, newValue: 12000 }),
        effectiveDate: new Date('2022-06-01'),
        isApproved: true,
        approvedById: adminUser.id,
        approvedAt: new Date(),
        createdById: inactiveUser.id,
      },
    ],
  });

  // Documento adjunto de ejemplo (si el modelo lo permite)
  if (prisma.document) {
    await prisma.document.create({
      data: {
        contractId: contracts[0].id,
        fileName: 'contrato-2025-001.pdf',
        filePath: '/data/documents/contrato-2025-001.pdf',
        mimeType: 'application/pdf',
        uploadedById: adminUser.id,
        uploadedAt: new Date(),
      },
    });
  }

  console.log('Datos de prueba extendidos creados exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 