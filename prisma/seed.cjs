const { PrismaClient, ContractStatus } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

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

  console.log("Usuarios creados correctamente");

  // Empresas para los contratos
  const companies = [
    { 
      name: "TecnoSoluciones",
      address: "Calle Principal #123, La Habana",
      phone: "+53 5 1234567",
      email: "info@tecnosoluciones.cu"
    },
    { 
      name: "InnovaTech",
      address: "Avenida 1ra #456, Varadero",
      phone: "+53 5 2345678",
      email: "contacto@innovatech.cu"
    },
    { 
      name: "GlobalSoft",
      address: "Calle 42 #789, Miramar",
      phone: "+53 5 3456789",
      email: "info@globalsoft.cu"
    },
    { 
      name: "DataCorp",
      address: "Calle 23 #1011, Vedado",
      phone: "+53 5 4567890",
      email: "contacto@datacorp.cu"
    },
    { 
      name: "NetSecure",
      address: "Calle 17 #1213, Playa",
      phone: "+53 5 5678901",
      email: "info@netsecure.cu"
    }
  ];

  // Crear representantes legales
  console.log("Creando representantes legales...");
  const representatives = [];
  
  for (let i = 0; i < companies.length; i++) {
    const rep = await prisma.legalRepresentative.create({
      data: {
        name: `Representante Legal ${i + 1}`,
        position: i % 2 === 0 ? "Director General" : "Gerente General",
        documentType: i % 2 === 0 ? "Carnet de Identidad" : "Pasaporte",
        documentNumber: `ID-${String(i + 1).padStart(4, '0')}`,
        documentDate: new Date(2020, i % 12, (i % 28) + 1),
        email: `rep${i + 1}@${companies[i].name.toLowerCase().replace(/\\s+/g, '')}.cu`,
        phone: `+53 5 ${String(1000000 + i).padStart(7, '0')}`,
        companyName: companies[i].name,
        companyAddress: companies[i].address,
        companyPhone: companies[i].phone,
        companyEmail: companies[i].email,
        createdById: adminUser.id
      }
    });
    representatives.push(rep);
  }
  
  console.log(`${representatives.length} representantes legales creados`);

  // Tipos de contratos
  const contractTypes = ["Proveedor", "Cliente"];
  
  // Crear contratos de ejemplo
  console.log("Creando contratos...");
  const contracts = [];
  
  for (let i = 0; i < 15; i++) {
    const companyIndex = i % companies.length;
    const repIndex = companyIndex % representatives.length;
    const type = contractTypes[i % contractTypes.length];
    
    // Generar fechas
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - (i % 12));
    
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1 + (i % 3));
    
    // Determinar estado basado en fechas
    let status = ContractStatus.ACTIVO;
    let isArchived = false;
    
    if (endDate < today) {
      status = ContractStatus.VENCIDO;
      // Algunos contratos vencidos se archivan
      if (i % 3 === 0) {
        isArchived = true;
      }
    }
    
    const contractNumber = `CONT-${startDate.getFullYear()}-${String(i + 1).padStart(3, '0')}`;
    
    // Crear el contrato
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        type,
        companyName: companies[companyIndex].name,
        legalRepresentativeId: representatives[repIndex].id,
        startDate,
        endDate,
        status,
        isArchived,
        createdById: adminUser.id,
        ownerId: adminUser.id
      }
    });
    
    contracts.push(contract);
    
    // Crear suplementos para algunos contratos
    if (i % 4 === 0) {
      await prisma.supplement.create({
        data: {
          title: `Suplemento 1 para ${contract.contractNumber}`,
          description: 'Este es un suplemento de ejemplo',
          changes: 'Se actualizaron los términos del contrato',
          effectiveDate: new Date(),
          isApproved: true,
          approvedById: adminUser.id,
          approvedAt: new Date(),
          contractId: contract.id,
          legalRepresentativeId: representatives[repIndex].id,
          createdById: adminUser.id
        }
      });
    }
  }
  
  console.log(`${contracts.length} contratos creados exitosamente`);
  console.log("Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });