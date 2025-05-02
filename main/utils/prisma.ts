import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Crear una única instancia de PrismaClient para toda la aplicación
export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

// Registrar eventos de Prisma para diagnóstico
prisma.$on('query', (e) => {
  logger.debug(`Prisma Query: ${e.query} (${e.duration}ms)`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on('info', (e) => {
  logger.info(`Prisma Info: ${e.message}`);
});

prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

// Inicializar conexión (puedes llamar a esta función desde main/index.ts)
export async function initPrisma() {
  try {
    await prisma.$connect();
    logger.info('Connected to database successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    return false;
  }
}