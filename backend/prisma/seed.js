import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando script de seed...');

  // Eliminar datos existentes para evitar duplicados
  await prisma.activity.deleteMany({});
  await prisma.accessLog.deleteMany({});
  await prisma.user.deleteMany({});

  // Crear usuarios del sistema (RA y admin)
  console.log('👤 Creando usuarios del sistema...');

  // Usuario RA (Desarrollador)
  const raUser = await prisma.user.create({
    data: {
      email: 'ra@pacta.dev',
      password: hashSync('Password123!', 10),
      firstName: 'Administrador',
      lastName: 'Desarrollador',
      role: 'RA',
      isSystemUser: true,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Usuario RA creado:', raUser.email);

  // Usuario Administrador
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@pacta.com',
      password: hashSync('Password123!', 10),
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: 'ADMIN',
      isSystemUser: true,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Usuario Admin creado:', adminUser.email);

  // Crear configuraciones del sistema
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'app_name',
        value: 'PACTA - Sistema de Gestión de Contratos',
        description: 'Nombre de la aplicación',
        type: 'string',
      },
      {
        key: 'company_name',
        value: 'Cliente PACTA',
        description: 'Nombre de la empresa cliente',
        type: 'string',
      },
      {
        key: 'notification_email',
        value: 'notificaciones@pacta.com',
        description: 'Email para notificaciones',
        type: 'string',
      },
      {
        key: 'enable_contract_renewals',
        value: 'true',
        description: 'Habilitar renovaciones de contratos',
        type: 'boolean',
      },
      {
        key: 'enable_email_notifications',
        value: 'true',
        description: 'Habilitar notificaciones por email',
        type: 'boolean',
      },
    ],
  });
  console.log('⚙️ Configuraciones del sistema creadas');

  console.log('✅ Seed completado correctamente');
}

main()
  .catch(e => {
    console.error('❌ Error durante la ejecución del seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
