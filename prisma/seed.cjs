const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Roles
  const adminRole =
    (await prisma.role.findUnique({ where: { name: "Admin" } })) ||
    (await prisma.role.create({
      data: {
        name: "Admin",
        description: "Administrador del sistema",
        permissions: JSON.stringify({
          contracts: ["create", "read", "update", "delete", "approve"],
          users: ["create", "read", "update", "delete"],
          system: ["configure", "backup"],
        }),
        isSystem: true,
      },
    }));
  const raRole =
    (await prisma.role.findUnique({ where: { name: "RA" } })) ||
    (await prisma.role.create({
      data: {
        name: "RA",
        description: "Responsable de Área",
        permissions: JSON.stringify({
          contracts: ["create", "read", "update"],
          users: ["read"],
          system: ["read"],
        }),
        isSystem: true,
      },
    }));

  // Usuarios
  const adminPassword = await hash("pacta2024", 10);
  const raPassword = await hash("pacta2024", 10);
  const adminUser =
    (await prisma.user.findUnique({ where: { email: "admin@pacta.local" } })) ||
    (await prisma.user.create({
      data: {
        name: "Administrador",
        email: "admin@pacta.local",
        password: adminPassword,
        roleId: adminRole.id,
        isActive: true,
      },
    }));
  const raUser =
    (await prisma.user.findUnique({ where: { email: "ra@pacta.local" } })) ||
    (await prisma.user.create({
      data: {
        name: "Responsable",
        email: "ra@pacta.local",
        password: raPassword,
        roleId: raRole.id,
        isActive: true,
      },
    }));
  const inactiveUser =
    (await prisma.user.findUnique({
      where: { email: "inactivo@pacta.local" },
    })) ||
    (await prisma.user.create({
      data: {
        name: "Usuario Inactivo",
        email: "inactivo@pacta.local",
        password: await hash("pacta2024", 10),
        roleId: raRole.id,
        isActive: false,
      },
    }));

  // Función para generar fechas de contrato
  const getContractDates = (status, index) => {
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milisegundos en un día

    switch (status) {
      case "Vencido":
        return {
          startDate: new Date(today.getTime() - (90 + index * 7) * oneDay),
          endDate: new Date(today.getTime() - (30 + index * 7) * oneDay),
        };
      case "Próximo a Vencer":
        return {
          startDate: new Date(today.getTime() - (60 + index * 5) * oneDay),
          endDate: new Date(today.getTime() + (15 + index * 2) * oneDay),
        };
      case "Vigente":
        return {
          startDate: new Date(today.getTime() - (30 + index * 3) * oneDay),
          endDate: new Date(today.getTime() + (90 + index * 5) * oneDay),
        };
      case "Archivado":
        return {
          startDate: new Date(today.getTime() - (180 + index * 10) * oneDay),
          endDate: new Date(today.getTime() - (120 + index * 5) * oneDay),
        };
      default:
        return {
          startDate: new Date(`2025-01-0${index + 1}`),
          endDate: new Date(`2025-12-2${index + 1}`),
        };
    }
  };

  // Tipos de contratos y estados
  const contractTypes = ["Proveedor", "Cliente"];
  const contractStatuses = [
    "VIGENTE",
    "VENCIDO",
    "ACTIVO",
    "TERMINADO",
    "CANCELADO",
    "PENDIENTE",
  ];
  const companies = [
    "TecnoSoluciones",
    "InnovaTech",
    "GlobalSoft",
    "DataCorp",
    "NetSecure",
    "CloudSystems",
    "WebMasters",
    "CodeCraft",
    "DigitalMind",
    "FutureTech",
  ];

  // Crear 20 contratos de ejemplo
  const contratos = [];
  for (let i = 1; i <= 20; i++) {
    // Asignar estados válidos del enum
    let status = contractStatuses[(i - 1) % contractStatuses.length];
    let isArchived = false;
    // Simular algunos contratos vencidos y archivados
    if (status === "VENCIDO" && i % 4 === 0) {
      isArchived = true;
    }
    // Simular contratos próximos a vencer como VIGENTE con endDate cercana
    let startDate, endDate;
    if (status === "VIGENTE" && i % 5 === 0) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 2);
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 10); // Próximo a vencer
    } else if (status === "VENCIDO") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() - 6);
    } else {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
    }
    const contractNumber = `CONT-${startDate.getFullYear()}-${String(
      i
    ).padStart(3, "0")}`;
    const companyIndex = (i - 1) % companies.length;
    const type = contractTypes[(i - 1) % contractTypes.length];

    const contrato = await prisma.contract.upsert({
      where: { contractNumber },
      update: {},
      create: {
        contractNumber,
        signDate: new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 días antes de startDate
        signPlace: `Ciudad ${(i % 10) + 1}`,
        type,
        companyName: companies[companyIndex],
        companyAddress: `Calle ${(i % 20) + 1} #${100 + i}`,
        nationality:
          i % 3 === 0 ? "Cubana" : i % 3 === 1 ? "Extranjera" : "Mixta",
        commercialAuth: `MN-${startDate.getFullYear()}-${String(i).padStart(
          3,
          "0"
        )}`,
        bankAccount: `12345678${i}`,
        bankBranch: `Sucursal ${(i % 5) + 1}`,
        bankAgency: `Agencia ${(i % 3) + 1}`,
        bankHolder: `${companies[companyIndex]} S.A.`,
        bankCurrency: i % 2 === 0 ? "MLC" : "CUP",
        reeupCode: `REEUP-${String(i).padStart(
          3,
          "0"
        )}-${startDate.getFullYear()}`,
        nit: `NIT-${String(i).padStart(3, "0")}-${startDate.getFullYear()}`,
        contactPhones: JSON.stringify([
          `555-${String(100 + i).padStart(3, "0")}`,
          `555-${String(200 + i).padStart(3, "0")}`,
        ]),
        repName: `Representante ${i}`,
        repPosition: i % 2 === 0 ? "Director" : "Gerente",
        repDocumentType: i % 2 === 0 ? "Resolución" : "Poder Notarial",
        repDocumentNumber: `DOC-${startDate.getFullYear()}-${String(i).padStart(
          3,
          "0"
        )}`,
        repDocumentDate: new Date(
          startDate.getTime() - 45 * 24 * 60 * 60 * 1000
        ), // 45 días antes de startDate
        description: `Contrato de ${type.toLowerCase()} con ${
          companies[companyIndex]
        }`,
        providerObligations: JSON.stringify(
          [
            `Obligación proveedor ${i}`,
            i % 3 === 0 ? "Mantenimiento incluido" : "",
            i % 2 === 0 ? "Soporte 24/7" : "",
          ].filter(Boolean)
        ),
        clientObligations: JSON.stringify(
          [
            `Obligación cliente ${i}`,
            i % 4 === 0 ? "Pago puntual" : "",
            i % 3 === 0 ? "Espacio de trabajo" : "",
          ].filter(Boolean)
        ),
        deliveryPlace: `Lugar de entrega ${(i % 5) + 1}`,
        deliveryTerm: `${(i % 7) + 3} días hábiles`,
        acceptanceProcedure: `Procedimiento de aceptación ${(i % 3) + 1}`,
        value: 5000 + i * 1234.56,
        currency: i % 2 === 0 ? "MLC" : "MN",
        paymentMethod:
          i % 3 === 0 ? "Transferencia" : i % 3 === 1 ? "Cheque" : "Efectivo",
        paymentTerm: `${15 + (i % 10)} días`,
        warrantyTerm: `${6 + (i % 6)} meses`,
        warrantyScope: `Cobertura garantía ${(i % 4) + 1}`,
        technicalStandards: `ISO 900${(i % 3) + 1}`,
        claimProcedure: `Procedimiento de reclamación ${(i % 3) + 1}`,
        disputeResolution: `Resolución de disputas ${(i % 2) + 1}`,
        latePaymentInterest: `${(i % 5) + 1}% mensual`,
        breachPenalties: `${(i % 10) + 5}% del valor`,
        notificationMethods: JSON.stringify([
          "Correo electrónico",
          i % 2 === 0 ? "Carta certificada" : "Notificación personal",
        ]),
        minimumNoticeTime: `${10 + (i % 10)} días`,
        startDate,
        endDate,
        extensionTerms: `Términos de prórroga ${(i % 3) + 1}`,
        earlyTerminationNotice: `${30 + (i % 10)} días`,
        forceMajeure: `Cláusula de fuerza mayor ${(i % 2) + 1}`,
        status,
        isArchived,
        isRestricted: i % 5 === 0, // 20% de los contratos son restringidos
        createdById: i % 3 === 0 ? adminUser.id : raUser.id,
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
        changes: JSON.stringify({
          field: "value",
          oldValue: 10000 * (i + 1),
          newValue: 12000 * (i + 1),
        }),
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
        mimeType: "application/pdf",
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
  const adminPref =
    (await prisma.userPreference.findUnique({
      where: { userId: adminUser.id },
    })) ||
    (await prisma.userPreference.create({
      data: {
        userId: adminUser.id,
        theme: "light",
        notificationsEnabled: true,
        notificationDays: 30,
      },
    }));
  const raPref =
    (await prisma.userPreference.findUnique({
      where: { userId: raUser.id },
    })) ||
    (await prisma.userPreference.create({
      data: {
        userId: raUser.id,
        theme: "light",
        notificationsEnabled: true,
        notificationDays: 30,
      },
    }));

  // Configuración del sistema
  const backupSetting =
    (await prisma.systemSetting.findUnique({
      where: { key: "backup_retention_days" },
    })) ||
    (await prisma.systemSetting.create({
      data: {
        key: "backup_retention_days",
        value: "7",
        category: "backup",
      },
    }));

  console.log("Seed de datos mockup ejecutado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
