/**
 * Prisma Client para la aplicación
 * Proporciona una única instancia de cliente para toda la aplicación
 */
import { PrismaClient } from '@prisma/client';

// Crear una instancia global de PrismaClient
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Función para probar la conexión a la base de datos
export const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Prisma conectado a la base de datos SQLite correctamente');
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
};

// Función para desconectar el cliente
export const disconnect = async () => {
  await prisma.$disconnect();
};

export default prisma; 