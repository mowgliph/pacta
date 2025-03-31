import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Pacta.25*';

async function seedSystemUsers() {
  try {
    // Verificar si ya existen los usuarios del sistema
    const existingRA = await prisma.user.findFirst({
      where: { role: 'RA' }
    });

    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    // Crear usuario RA si no existe
    if (!existingRA) {
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      await prisma.user.create({
        data: {
          email: 'ra@pacta.local',
          password: hashedPassword,
          firstName: 'RA',
          lastName: 'System',
          role: 'RA',
          isSystemUser: true,
          status: 'ACTIVE'
        }
      });
      console.log('Usuario RA creado exitosamente');
    }

    // Crear usuario Admin si no existe
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      await prisma.user.create({
        data: {
          email: 'admin@pacta.local',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'System',
          role: 'ADMIN',
          isSystemUser: true,
          status: 'ACTIVE'
        }
      });
      console.log('Usuario Admin creado exitosamente');
    }

    console.log('Inicialización de usuarios del sistema completada');
  } catch (error) {
    console.error('Error al inicializar usuarios del sistema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default seedSystemUsers; 