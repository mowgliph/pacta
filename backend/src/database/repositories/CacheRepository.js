import prisma from '../prisma.js';
import { logger } from '../../utils/logger.js';

class CacheRepository {
  /**
   * Guarda un valor en el cache
   * @param {string} key - Clave única del valor
   * @param {any} value - Valor a guardar (será serializado como JSON)
   * @param {number} ttl - Tiempo de vida en segundos
   * @returns {Promise<object>} - Entrada de cache creada
   */
  async set(key, value, ttl = 3600) {
    try {
      // Convertir a string si no lo es
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + ttl);

      // Buscar si ya existe la clave
      const existingCache = await prisma.cache.findUnique({
        where: { key },
      });

      // Actualizar o crear según corresponda
      if (existingCache) {
        return prisma.cache.update({
          where: { key },
          data: {
            value: stringValue,
            expiresAt,
            updatedAt: new Date(),
          },
        });
      } else {
        return prisma.cache.create({
          data: {
            key,
            value: stringValue,
            expiresAt,
          },
        });
      }
    } catch (error) {
      logger.error('Error setting cache', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Obtiene un valor del cache
   * @param {string} key - Clave del valor a obtener
   * @returns {Promise<any>} - Valor almacenado o null si no existe o expiró
   */
  async get(key) {
    try {
      const cache = await prisma.cache.findUnique({
        where: { key },
      });

      // Si no existe o ha expirado, retornar null
      if (!cache || new Date() > new Date(cache.expiresAt)) {
        if (cache && new Date() > new Date(cache.expiresAt)) {
          // Eliminar entradas expiradas
          await this.delete(key);
        }
        return null;
      }

      // Intentar parsear el valor como JSON
      try {
        return JSON.parse(cache.value);
      } catch (e) {
        // Si no es JSON válido, retornar el valor como string
        return cache.value;
      }
    } catch (error) {
      logger.error('Error getting cache', { key, error: error.message });
      return null;
    }
  }

  /**
   * Elimina una entrada del cache
   * @param {string} key - Clave a eliminar
   * @returns {Promise<boolean>} - true si se eliminó, false si no existía
   */
  async delete(key) {
    try {
      const result = await prisma.cache
        .delete({
          where: { key },
        })
        .catch(() => null);

      return !!result;
    } catch (error) {
      logger.error('Error deleting cache', { key, error: error.message });
      return false;
    }
  }

  /**
   * Elimina múltiples entradas del cache por patrón
   * @param {string} pattern - Patrón de clave a eliminar (e.j. "user:*")
   * @returns {Promise<number>} - Número de entradas eliminadas
   */
  async deletePattern(pattern) {
    try {
      const wildcardPattern = pattern.replace('*', '%');

      const result = await prisma.cache.deleteMany({
        where: {
          key: {
            contains: wildcardPattern,
          },
        },
      });

      return result.count;
    } catch (error) {
      logger.error('Error deleting cache pattern', { pattern, error: error.message });
      return 0;
    }
  }

  /**
   * Elimina todas las entradas expiradas del cache
   * @returns {Promise<number>} - Número de entradas eliminadas
   */
  async clearExpired() {
    try {
      const now = new Date();

      const result = await prisma.cache.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      if (result.count > 0) {
        logger.info(`Cleared ${result.count} expired cache entries`);
      }

      return result.count;
    } catch (error) {
      logger.error('Error clearing expired cache', { error: error.message });
      return 0;
    }
  }

  /**
   * Vacía completamente el cache
   * @returns {Promise<number>} - Número de entradas eliminadas
   */
  async flush() {
    try {
      const result = await prisma.cache.deleteMany({});

      logger.info(`Flushed ${result.count} cache entries`);

      return result.count;
    } catch (error) {
      logger.error('Error flushing cache', { error: error.message });
      return 0;
    }
  }
}

export default new CacheRepository();
