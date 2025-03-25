/**
 * Servicio de caché para el frontend usando Dexie.js
 * Proporciona funcionalidades para almacenar y recuperar datos en caché de manera local
 */
import Dexie, { Table } from 'dexie';

// Definición de interfaces para las tablas
interface CacheItem {
  id: string;
  data: any;
  expiresAt: number;
  category: string;
  createdAt: number;
  updatedAt: number;
}

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  resource: string;
  data: any;
  status: 'pending' | 'processing' | 'failed';
  error?: string;
  attempts: number;
  createdAt: number;
  updatedAt: number;
}

// Base de datos Dexie
class CacheDatabase extends Dexie {
  cacheItems!: Table<CacheItem>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('PACTACache');
    
    this.version(1).stores({
      cacheItems: 'id, category, expiresAt',
      syncQueue: 'id, resource, status, createdAt'
    });
  }
}

// Instancia única de la base de datos
const db = new CacheDatabase();

// Configuración por defecto
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const MAX_QUEUE_ATTEMPTS = 5;

/**
 * Servicio de caché para almacenamiento y recuperación de datos
 */
export class CacheService {
  /**
   * Guarda un elemento en caché
   * @param key Clave única para el elemento
   * @param data Datos a almacenar
   * @param category Categoría opcional para agrupar elementos
   * @param duration Duración en milisegundos antes de que expire (default: 24h)
   */
  static async set(
    key: string, 
    data: any, 
    category: string = 'general', 
    duration: number = DEFAULT_CACHE_DURATION
  ): Promise<void> {
    const now = Date.now();
    const expiresAt = now + duration;
    
    try {
      await db.cacheItems.put({
        id: key,
        data,
        category,
        expiresAt,
        createdAt: now,
        updatedAt: now
      });
    } catch (error) {
      console.error('Error storing item in cache:', error);
      throw error;
    }
  }

  /**
   * Recupera un elemento de la caché
   * @param key Clave del elemento a recuperar
   * @returns Datos almacenados o null si no existe o ha expirado
   */
  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const cacheItem = await db.cacheItems.get(key);
      
      if (!cacheItem) {
        return null;
      }
      
      // Verificar si el elemento ha expirado
      if (cacheItem.expiresAt < Date.now()) {
        // Eliminar elemento expirado en segundo plano
        this.remove(key).catch(e => console.error('Error removing expired item:', e));
        return null;
      }
      
      return cacheItem.data as T;
    } catch (error) {
      console.error('Error retrieving item from cache:', error);
      return null;
    }
  }

  /**
   * Elimina un elemento de la caché
   * @param key Clave del elemento a eliminar
   */
  static async remove(key: string): Promise<void> {
    try {
      await db.cacheItems.delete(key);
    } catch (error) {
      console.error('Error removing item from cache:', error);
      throw error;
    }
  }

  /**
   * Limpia todos los elementos de una categoría
   * @param category Categoría a limpiar
   */
  static async clearCategory(category: string): Promise<void> {
    try {
      await db.cacheItems.where('category').equals(category).delete();
    } catch (error) {
      console.error(`Error clearing category ${category} from cache:`, error);
      throw error;
    }
  }

  /**
   * Limpia todos los elementos expirados
   */
  static async clearExpired(): Promise<number> {
    try {
      const now = Date.now();
      const count = await db.cacheItems.where('expiresAt').below(now).delete();
      return count;
    } catch (error) {
      console.error('Error clearing expired items from cache:', error);
      throw error;
    }
  }

  /**
   * Limpia toda la caché
   */
  static async clearAll(): Promise<void> {
    try {
      await db.cacheItems.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Añade un elemento a la cola de sincronización
   * @param resource Tipo de recurso (ej: 'contracts', 'users')
   * @param action Acción a realizar
   * @param data Datos asociados a la acción
   */
  static async addToSyncQueue(
    resource: string,
    action: 'create' | 'update' | 'delete',
    data: any
  ): Promise<string> {
    const now = Date.now();
    const id = `${resource}-${now}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      await db.syncQueue.add({
        id,
        resource,
        action,
        data,
        status: 'pending',
        attempts: 0,
        createdAt: now,
        updatedAt: now
      });
      
      return id;
    } catch (error) {
      console.error('Error adding item to sync queue:', error);
      throw error;
    }
  }

  /**
   * Obtiene elementos pendientes de la cola de sincronización
   */
  static async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    try {
      return await db.syncQueue.where('status').equals('pending').toArray();
    } catch (error) {
      console.error('Error getting pending sync items:', error);
      return [];
    }
  }

  /**
   * Actualiza el estado de un elemento en la cola de sincronización
   * @param id ID del elemento
   * @param status Nuevo estado
   * @param error Mensaje de error opcional
   */
  static async updateSyncItemStatus(
    id: string,
    status: 'pending' | 'processing' | 'failed',
    error?: string
  ): Promise<void> {
    try {
      const item = await db.syncQueue.get(id);
      
      if (!item) {
        throw new Error(`Sync item with id ${id} not found`);
      }
      
      let attempts = item.attempts;
      if (status === 'failed') {
        attempts += 1;
      }
      
      await db.syncQueue.update(id, {
        status,
        error,
        attempts,
        updatedAt: Date.now()
      });
      
      // Si excedió el número máximo de intentos, mover a fallidos permanentemente
      if (attempts >= MAX_QUEUE_ATTEMPTS) {
        console.warn(`Sync item ${id} failed after ${attempts} attempts`);
      }
    } catch (error) {
      console.error(`Error updating sync item ${id} status:`, error);
      throw error;
    }
  }

  /**
   * Elimina un elemento de la cola de sincronización
   * @param id ID del elemento a eliminar
   */
  static async removeSyncItem(id: string): Promise<void> {
    try {
      await db.syncQueue.delete(id);
    } catch (error) {
      console.error(`Error removing sync item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Inicializa el servicio
   */
  static async init(): Promise<void> {
    try {
      // Limpiar elementos expirados al iniciar
      const count = await this.clearExpired();
      if (count > 0) {
        console.log(`Cleared ${count} expired items from cache`);
      }
      
      // Configurar limpieza periódica (cada hora)
      setInterval(() => {
        this.clearExpired().catch(e => console.error('Error in periodic cleanup:', e));
      }, 60 * 60 * 1000);
      
    } catch (error) {
      console.error('Error initializing cache service:', error);
    }
  }
}

// Inicializar el servicio al importarlo
CacheService.init().catch(e => console.error('Failed to initialize cache service:', e)); 