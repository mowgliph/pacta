import cacheRepository from '../database/repositories/CacheRepository.js';
import { logger } from '../utils/logger.js';
import config from '../config/app.config.js';
import { prisma } from '../database/prisma.js';

class CacheService {
  constructor(namespace = '') {
    this.namespace = namespace ? `${namespace}:` : '';
    this.defaultTtl = parseInt(config.cache?.ttl || 3600);
  }

  /**
   * Obtiene un valor del cache
   * @param {string} key - Clave a buscar
   * @param {Function} fetchFn - Función para obtener el valor si no está en cache
   * @param {number} ttl - Tiempo de vida en segundos
   * @returns {Promise<any>} - Valor almacenado o resultado de fetchFn
   */
  async get(key, fetchFn = null, ttl = this.defaultTtl) {
    try {
      const fullKey = this._getFullKey(key);
      const cachedValue = await cacheRepository.get(fullKey);

      if (cachedValue !== null) {
        logger.debug('Cache hit', { key: fullKey });
        return cachedValue;
      }

      logger.debug('Cache miss', { key: fullKey });

      if (fetchFn) {
        const freshValue = await fetchFn();
        await this.set(key, freshValue, ttl);
        return freshValue;
      }

      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return fetchFn ? await fetchFn() : null;
    }
  }

  /**
   * Guarda un valor en el cache
   * @param {string} key - Clave única
   * @param {any} value - Valor a guardar
   * @param {number} ttl - Tiempo de vida en segundos
   * @returns {Promise<boolean>} - true si se guardó correctamente
   */
  async set(key, value, ttl = this.defaultTtl) {
    try {
      const fullKey = this._getFullKey(key);
      await cacheRepository.set(fullKey, value, ttl);
      logger.debug('Cache set', { key: fullKey, ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Elimina un valor del cache
   * @param {string} key - Clave a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async invalidate(key) {
    try {
      const fullKey = this._getFullKey(key);
      const result = await cacheRepository.delete(fullKey);
      logger.debug('Cache delete', { key: fullKey, success: result });
      return result;
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Elimina múltiples valores del cache por patrón
   * @param {string} pattern - Patrón de clave (e.j. "user:*")
   * @returns {Promise<number>} - Número de entradas eliminadas
   */
  async invalidatePattern(pattern) {
    try {
      const fullPattern = this._getFullKey(pattern);
      const count = await cacheRepository.deletePattern(fullPattern);
      logger.debug('Cache delete pattern', { pattern: fullPattern, count });
      return count;
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error: error.message });
      return 0;
    }
  }

  /**
   * Elimina todas las entradas del cache
   * @returns {Promise<boolean>} - true si se vació correctamente
   */
  async flush() {
    try {
      if (this.namespace) {
        // Solo vaciar las entradas del namespace
        const count = await cacheRepository.deletePattern(`${this.namespace}*`);
        logger.info(`Cache namespace flushed: ${this.namespace}`, { count });
        return true;
      } else {
        // Vaciar todo el cache
        const count = await cacheRepository.flush();
        logger.info('Cache flushed completely', { count });
        return true;
      }
    } catch (error) {
      logger.error('Cache flush error', { namespace: this.namespace, error: error.message });
      return false;
    }
  }

  /**
   * Elimina entradas expiradas del cache
   * @returns {Promise<number>} - Número de entradas eliminadas
   */
  async clearExpired() {
    try {
      const count = await cacheRepository.clearExpired();
      if (count > 0) {
        logger.info('Expired cache entries cleared', { count });
      }
      return count;
    } catch (error) {
      logger.error('Clear expired cache error', { error: error.message });
      return 0;
    }
  }

  /**
   * Obtiene una función que usa el cache
   * @param {string} key - Clave para cachear
   * @param {Function} fn - Función a ejecutar si no hay cache
   * @param {number} ttl - Tiempo de vida en segundos
   * @returns {Function} - Función envuelta con cache
   */
  wrap(key, fn, ttl = this.defaultTtl) {
    return async (...args) => {
      const cacheKey = `${key}:${JSON.stringify(args)}`;
      return this.get(cacheKey, () => fn(...args), ttl);
    };
  }

  /**
   * Obtiene un valor o lo guarda en cache
   * @param {string} key - Clave para cachear
   * @param {Function} fn - Función para obtener el valor
   * @param {number} ttl - Tiempo de vida en segundos
   * @returns {Promise<any>} - Valor del cache o de la función
   */
  async remember(key, fn, ttl = this.defaultTtl) {
    return this.get(key, fn, ttl);
  }

  /**
   * Añade un prefijo a la clave basado en el namespace
   * @param {string} key - Clave original
   * @returns {string} - Clave con prefijo
   * @private
   */
  _getFullKey(key) {
    return `${this.namespace}${key}`;
  }

  // Métodos específicos para modelos
  
  /**
   * Obtiene un usuario del cache o la base de datos
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} - Usuario
   */
  async getCachedUser(userId) {
    return this.get(`user:${userId}`, async () => {
      return prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });
    });
  }

  /**
   * Obtiene un contrato del cache o la base de datos
   * @param {number} contractId - ID del contrato
   * @returns {Promise<Object>} - Contrato con relaciones
   */
  async getCachedContract(contractId) {
    return this.get(`contract:${contractId}`, async () => {
      return prisma.contract.findUnique({
        where: { id: parseInt(contractId) },
        include: {
          user: true,
          license: true,
        },
      });
    });
  }

  /**
   * Obtiene notificaciones del cache o la base de datos
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} - Lista de notificaciones
   */
  async getCachedNotifications(userId) {
    return this.get(
      `notifications:${userId}`,
      async () => {
        return prisma.notification.findMany({
          where: { userId: parseInt(userId) },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
      },
      300 // 5 minutos para notificaciones
    );
  }

  /**
   * Inicializa el proceso de limpieza periódica del cache
   * @returns {NodeJS.Timeout} - Timer ID
   */
  static initCleanupTask() {
    const interval = parseInt(config.cache?.checkPeriod || 600) * 1000;
    logger.info(`Initializing cache cleanup task with interval ${interval/1000} seconds`);
    
    return setInterval(async () => {
      try {
        const repository = cacheRepository;
        const count = await repository.clearExpired();
        if (count > 0) {
          logger.info(`Cache cleanup: removed ${count} expired entries`);
        }
      } catch (error) {
        logger.error('Error in cache cleanup task', { error: error.message });
      }
    }, interval);
  }
}

export default CacheService;
