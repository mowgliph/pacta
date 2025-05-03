const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Roles
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

  // Usuarios
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

  // Contratos de ejemplo (5 contratos)
  const contratos = [];
  for (let i = 1; i <= 5; i++) {
    const contractNumber = `CONT-2025-00${i}`;
    const contrato = await prisma.contract.findUnique({ where: { contractNumber } })
      || await prisma.contract.create({
        data: {
          contractNumber,
          signDate: new Date(`2024-12-${10 + i}`),
          signPlace: `Ciudad ${i}`,
          type: i % 2 === 0 ? 'Proveedor' : 'Cliente',
          companyName: `Empresa ${String.fromCharCode(64 + i)}`,
          companyAddress: `Calle ${i} #${100 + i}`,
          nationality: 'Cubana',
          commercialAuth: `MN-2025-00${i}`,
          bankAccount: `12345678${i}`,
          bankBranch: `Sucursal ${i}`,
          bankAgency: `Agencia ${i}`,
          bankHolder: `Empresa ${String.fromCharCode(64 + i)} S.A.`,
          bankCurrency: i % 2 === 0 ? 'MLC' : 'CUP',
          reeupCode: `REEUP-00${i}-2025`,
          nit: `NIT-00${i}-2025`,
          contactPhones: JSON.stringify([`555-00${i}1`, `555-00${i}2`]),
          repName: `Representante ${i}`,
          repPosition: 'Director',
          repDocumentType: 'Resolución',
          repDocumentNumber: `RES-2025-00${i}`,
          repDocumentDate: new Date(`2024-11-${10 + i}`),
          description: `Contrato de ejemplo ${i}`,
          providerObligations: JSON.stringify([
            `Obligación proveedor ${i}`
          ]),
          clientObligations: JSON.stringify([
            `Obligación cliente ${i}`
          ]),
          deliveryPlace: `Lugar entrega ${i}`,
          deliveryTerm: `${i + 2} días hábiles`,
          acceptanceProcedure: `Procedimiento ${i}`,
          value: 10000 * i,
          currency: i % 2 === 0 ? 'MLC' : 'MN',
          paymentMethod: 'Transferencia',
          paymentTerm: `${15 + i} días`,
          warrantyTerm: `${6 + i} meses`,
          warrantyScope: `Cobertura ${i}`,
          technicalStandards: `ISO 900${i}`,
          claimProcedure: `Reclamo ${i}`,
          disputeResolution: `Resolución ${i}`,
          latePaymentInterest: `${i}% mensual`,
          breachPenalties: `${i * 2}% del valor`,
          notificationMethods: JSON.stringify(['Correo electrónico', 'Carta certificada']),
          minimumNoticeTime: `${10 + i} días`,
          startDate: new Date(`2025-01-0${i}`),
          endDate: new Date(`2025-12-2${i}`),
          extensionTerms: `Prórroga ${i}`,
          earlyTerminationNotice: `${30 + i} días`,
          forceMajeure: `Fuerza mayor ${i}`,
          status: i === 1 ? 'Vigente' : i === 2 ? 'Vencido' : i === 3 ? 'Próximo a Vencer' : i === 4 ? 'Archivado' : 'Vigente',
          isRestricted: false,
          createdById: adminUser.id,
          ownerId: i % 2 === 0 ? raUser.id : adminUser.id,
        },
      });
    contratos.push(contrato);
  }

  // Suplementos de ejemplo (5 suplementos, uno por contrato)
  for (let i = 0; i < 5; i++) {
    await prisma.supplement.create({
      data: {
        contractId: contratos[i].id,
        title: `Suplemento ${i + 1}`,
        description: `Descripción del suplemento ${i + 1}`,
        changes: JSON.stringify({ field: 'value', oldValue: 10000 * (i + 1), newValue: 12000 * (i + 1) }),
        effectiveDate: new Date(`2025-06-0${i + 1}`),
        isApproved: i % 2 === 0,
        approvedById: i % 2 === 0 ? adminUser.id : null,
        approvedAt: i % 2 === 0 ? new Date() : null,
        createdById: raUser.id,
      },
    });
  }

  // Documentos de ejemplo (5 documentos, uno por contrato)
  for (let i = 0; i < 5; i++) {
    await prisma.document.create({
      data: {
        filename: `contrato-2025-00${i + 1}.pdf`,
        originalName: `Contrato Original ${i + 1}.pdf`,
        mimeType: 'application/pdf',
        size: 102400 + i * 1000,
        path: `/data/documents/contrato-2025-00${i + 1}.pdf`,
        contractId: contratos[i].id,
        uploadedById: adminUser.id,
        uploadedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Preferencias de usuario
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

  // Configuración del sistema
  const backupSetting = await prisma.systemSetting.findUnique({ where: { key: 'backup_retention_days' } })
    || await prisma.systemSetting.create({
      data: {
        key: 'backup_retention_days',
        value: '7',
        category: 'backup',
      },
    });

  console.log('Seed de datos mockup ejecutado correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 