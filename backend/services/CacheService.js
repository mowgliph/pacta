import NodeCache from 'node-cache';
import { LoggingService } from './LoggingService.js';
import config from '../config/app.config.js';

export class CacheService {
  static cache = new NodeCache({
    stdTTL: 600, // 10 minutes default TTL
    checkperiod: 120, // Check for expired keys every 2 minutes
    useClones: false
  });

  static async get(key, fetchFn = null, ttl = 600) {
    try {
      const value = this.cache.get(key);
      
      if (value !== undefined) {
        LoggingService.logCacheOperation('get', key, true);
        return value;
      }

      if (fetchFn) {
        const freshValue = await fetchFn();
        this.set(key, freshValue, ttl);
        LoggingService.logCacheOperation('get', key, false);
        return freshValue;
      }

      return null;
    } catch (error) {
      LoggingService.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  static set(key, value, ttl = 600) {
    try {
      const success = this.cache.set(key, value, ttl);
      LoggingService.logCacheOperation('set', key, success);
      return success;
    } catch (error) {
      LoggingService.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  static del(key) {
    try {
      const count = this.cache.del(key);
      LoggingService.logCacheOperation('delete', key, count > 0);
      return count > 0;
    } catch (error) {
      LoggingService.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  static flush() {
    try {
      this.cache.flushAll();
      LoggingService.logCacheOperation('flush', 'all', true);
      return true;
    } catch (error) {
      LoggingService.error('Cache flush error', { error: error.message });
      return false;
    }
  }

  static getStats() {
    return this.cache.getStats();
  }

  static keys() {
    return this.cache.keys();
  }

  static has(key) {
    return this.cache.has(key);
  }

  static mget(keys) {
    try {
      return this.cache.mget(keys);
    } catch (error) {
      LoggingService.error('Cache mget error', { keys, error: error.message });
      return {};
    }
  }

  static mset(items, ttl = 600) {
    try {
      return this.cache.mset(items.map(item => ({
        key: item.key,
        val: item.value,
        ttl
      })));
    } catch (error) {
      LoggingService.error('Cache mset error', { items, error: error.message });
      return false;
    }
  }

  static mdel(keys) {
    try {
      return this.cache.del(keys);
    } catch (error) {
      LoggingService.error('Cache mdel error', { keys, error: error.message });
      return 0;
    }
  }

  static wrap(key, fn, ttl = 600) {
    return async (...args) => {
      const cached = await this.get(key);
      if (cached !== undefined) {
        return cached;
      }

      const result = await fn(...args);
      this.set(key, result, ttl);
      return result;
    };
  }

  static async remember(key, ttl, fn) {
    const cached = await this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }

  static async rememberForever(key, fn) {
    return this.remember(key, 0, fn);
  }

  static async tags(tags) {
    const keys = this.keys();
    return keys.filter(key => {
      const keyTags = this.cache.get(`${key}:tags`);
      return keyTags && tags.every(tag => keyTags.includes(tag));
    });
  }

  static async tagged(tags, key, value, ttl = 600) {
    this.set(key, value, ttl);
    this.set(`${key}:tags`, tags, ttl);
  }

  static async flushTagged(tags) {
    const keys = await this.tags(tags);
    return this.mdel(keys);
  }

  // Métodos específicos para el negocio
  static async getCachedUser(userId) {
    return this.get(`user:${userId}`, async () => {
      const { User } = await import('../models/index.js');
      return User.findByPk(userId);
    });
  }

  static async getCachedContract(contractId) {
    return this.get(`contract:${contractId}`, async () => {
      const { Contract } = await import('../models/index.js');
      return Contract.findByPk(contractId, {
        include: ['User', 'License']
      });
    });
  }

  static async getCachedNotifications(userId) {
    return this.get(`notifications:${userId}`, async () => {
      const { Notification } = await import('../models/index.js');
      return Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 10
      });
    }, 300); // 5 minutos para notificaciones
  }

  static async invalidateUserCache(userId) {
    this.del(`user:${userId}`);
  }

  static async invalidateContractCache(contractId) {
    this.del(`contract:${contractId}`);
  }

  static async invalidateNotificationsCache(userId) {
    this.del(`notifications:${userId}`);
  }
}

export default new CacheService(); 