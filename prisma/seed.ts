import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

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
        title: 'Contrato de Servicios TI',
        description: 'Servicios de mantenimiento de infraestructura',
        parties: 'Empresa A, Empresa B',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        amount: 50000,
        status: 'Vigente',
        type: 'Cliente',
        companyName: 'Empresa A',
        companyAddress: 'Calle Principal 123',
        signDate: new Date('2024-12-15'),
        signPlace: 'Ciudad Principal',
        paymentMethod: 'Transferencia',
        paymentTerm: '30 días',
        createdById: adminUser.id,
        ownerId: raUser.id,
      },
    }),
    prisma.contract.create({
      data: {
        contractNumber: 'CONT-2025-002',
        title: 'Contrato de Suministros',
        description: 'Suministro de materiales de oficina',
        parties: 'Empresa B, Empresa C',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-07-31'),
        amount: 25000,
        status: 'Vigente',
        type: 'Proveedor',
        companyName: 'Empresa B',
        companyAddress: 'Avenida Secundaria 456',
        signDate: new Date('2024-12-20'),
        signPlace: 'Ciudad Secundaria',
        paymentMethod: 'Transferencia',
        paymentTerm: '15 días',
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