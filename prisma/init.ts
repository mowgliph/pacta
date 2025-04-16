import { PrismaClient, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function initializeDefaultUsers() {
  try {
    // Verificar la conexión a la base de datos
    await prisma.$connect();
    
    // Hash de la contraseña 'pacta'
    const defaultPassword = await argon2.hash('pacta');

    // Crear usuario RA si no existe
    const ra = await prisma.user.upsert({
      where: { username: 'ra' },
      update: {},
      create: {
        username: 'ra',
        email: 'ra@pacta.dev',
        password: defaultPassword,
        role: 'RA',
        notifyEnabled: true,
      },
    });

    // Crear usuario Admin si no existe
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@pacta.dev',
        password: defaultPassword,
        role: 'Admin',
        notifyEnabled: true,
      },
    });

    console.log('✅ Usuarios por defecto creados/verificados:');
    console.log(`- RA: ${ra.username}`);
    console.log(`- Admin: ${admin.username}`);

  } catch (error: unknown) {
    console.error('❌ Error al crear usuarios por defecto:');
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Error de inicialización de Prisma:', error.message);
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error de Prisma conocido:', error.message);
      console.error('Código:', error.code);
    } else if (error instanceof Error) {
      console.error('Error general:', error.message);
    } else {
      console.error('Error desconocido:', error);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la inicialización con un pequeño retraso para asegurar que la base de datos esté lista
setTimeout(() => {
  initializeDefaultUsers();
}, 2000);