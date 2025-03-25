/**
 * Composable para utilizar el sistema de caché en componentes Vue
 */
import { ref, computed, Ref } from 'vue';
import { CacheService } from '@/services/cache-service';

interface UseCacheOptions {
  // Duración de la caché en milisegundos
  duration?: number;
  // Categoría para agrupar elementos en caché
  category?: string;
  // Si es true, siempre intenta cargar datos frescos
  revalidate?: boolean;
}

interface CacheState<T> {
  // Datos almacenados en caché
  data: Ref<T | null>;
  // Estado de carga
  loading: Ref<boolean>;
  // Error si ocurre alguno
  error: Ref<Error | null>;
  // Timestamp de la última vez que se cargaron los datos
  lastUpdated: Ref<number | null>;
  // Indica si los datos están cargados
  isLoaded: Ref<boolean>;
  // Indica si hay un error
  hasError: Ref<boolean>;
}

export function useCache<T = any>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
): CacheState<T> & {
  refresh: () => Promise<void>;
  invalidate: () => Promise<void>;
} {
  const {
    duration = 24 * 60 * 60 * 1000, // 24 horas por defecto
    category = 'general',
    revalidate = false
  } = options;

  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const lastUpdated = ref<number | null>(null);

  const isLoaded = computed(() => data.value !== null);
  const hasError = computed(() => error.value !== null);

  const fetchData = async (skipCache = false): Promise<void> => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      // Intentar obtener de caché primero, a menos que se indique lo contrario
      if (!skipCache) {
        const cachedData = await CacheService.get<T>(cacheKey);

        if (cachedData !== null) {
          data.value = cachedData;
          lastUpdated.value = Date.now();
          
          // Si no necesitamos revalidar, terminamos aquí
          if (!revalidate) {
            loading.value = false;
            return;
          }
        }
      }

      // Obtener datos frescos
      const freshData = await fetcher();
      
      // Guardar en caché
      await CacheService.set(cacheKey, freshData, category, duration);
      
      // Actualizar estado
      data.value = freshData;
      lastUpdated.value = Date.now();
      
    } catch (err) {
      console.error(`Error fetching data for cache key ${cacheKey}:`, err);
      error.value = err instanceof Error ? err : new Error(String(err));
      
      // Si hay un error pero tenemos datos en caché, usarlos como fallback
      if (data.value === null && !skipCache) {
        const cachedData = await CacheService.get<T>(cacheKey).catch(() => null);
        if (cachedData !== null) {
          data.value = cachedData;
          console.info(`Using cached data as fallback for ${cacheKey}`);
        }
      }
    } finally {
      loading.value = false;
    }
  };

  // Cargar datos de inmediato
  fetchData();

  // Función para forzar recarga de datos
  const refresh = async (): Promise<void> => {
    await fetchData(true);
  };

  // Función para invalidar caché
  const invalidate = async (): Promise<void> => {
    await CacheService.remove(cacheKey);
    data.value = null;
    lastUpdated.value = null;
  };

  return {
    data,
    loading,
    error,
    lastUpdated,
    isLoaded,
    hasError,
    refresh,
    invalidate
  };
}

/**
 * Composable para gestionar datos offline con sincronización
 * Útil para operaciones que requieren guardado local y sincronización posterior
 */
export function useOfflineSync<T extends { id?: string | number }>(
  resource: string
) {
  const pendingChanges = ref<number>(0);
  const syncing = ref<boolean>(false);
  const syncError = ref<Error | null>(null);

  // Crear un elemento localmente y agregarlo a la cola de sincronización
  const createOffline = async (data: Omit<T, 'id'>): Promise<string> => {
    try {
      // Generar ID temporal
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Agregar a cola de sincronización
      const syncId = await CacheService.addToSyncQueue(
        resource,
        'create',
        data
      );
      
      // Actualizar contador
      pendingChanges.value++;
      
      return syncId;
    } catch (error) {
      console.error('Error creating offline item:', error);
      throw error;
    }
  };

  // Actualizar un elemento localmente y agregarlo a la cola de sincronización
  const updateOffline = async (id: string | number, data: Partial<T>): Promise<string> => {
    try {
      // Agregar a cola de sincronización
      const syncId = await CacheService.addToSyncQueue(
        resource,
        'update',
        { id, ...data }
      );
      
      // Actualizar contador
      pendingChanges.value++;
      
      return syncId;
    } catch (error) {
      console.error('Error updating offline item:', error);
      throw error;
    }
  };

  // Eliminar un elemento localmente y agregarlo a la cola de sincronización
  const deleteOffline = async (id: string | number): Promise<string> => {
    try {
      // Agregar a cola de sincronización
      const syncId = await CacheService.addToSyncQueue(
        resource,
        'delete',
        { id }
      );
      
      // Actualizar contador
      pendingChanges.value++;
      
      return syncId;
    } catch (error) {
      console.error('Error deleting offline item:', error);
      throw error;
    }
  };

  // Obtener elementos pendientes de sincronización
  const getPendingChanges = async (): Promise<SyncQueueItem[]> => {
    try {
      return await CacheService.getPendingSyncItems();
    } catch (error) {
      console.error('Error getting pending changes:', error);
      return [];
    }
  };

  // Sincronizar cambios pendientes (a implementar por el consumidor)
  const syncChanges = async (syncFunction: (items: any[]) => Promise<void>): Promise<void> => {
    if (syncing.value) return;
    
    syncing.value = true;
    syncError.value = null;
    
    try {
      const pendingItems = await CacheService.getPendingSyncItems();
      
      if (pendingItems.length === 0) {
        syncing.value = false;
        return;
      }
      
      // Llamar a la función de sincronización proporcionada
      await syncFunction(pendingItems);
      
      // Actualizar contador
      pendingChanges.value = 0;
      
    } catch (error) {
      console.error('Error syncing changes:', error);
      syncError.value = error instanceof Error ? error : new Error(String(error));
    } finally {
      syncing.value = false;
    }
  };

  // Verificar cambios pendientes al inicializar
  CacheService.getPendingSyncItems()
    .then(items => {
      pendingChanges.value = items.filter(item => item.resource === resource).length;
    })
    .catch(error => {
      console.error('Error checking pending sync items:', error);
    });

  return {
    pendingChanges,
    syncing,
    syncError,
    createOffline,
    updateOffline,
    deleteOffline,
    getPendingChanges,
    syncChanges
  };
}

/**
 * Tipo para elementos en la cola de sincronización
 */
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