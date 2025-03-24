/**
 * Exporta todos los repositorios para facilitar las importaciones
 */

// Repositorios base
export { BasePrismaRepository } from './BasePrismaRepository.js';
export { BaseRepository } from './BaseRepository.js';

// Repositorios específicos
export { default as UserRepository } from './UserPrismaRepository.js'; 