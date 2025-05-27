"use client";
import { useEffect, useState } from "react";
import type { StatisticsDashboard } from "../types/electron.d";

const defaultStats: StatisticsDashboard['data'] = {
  totals: {
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
  },
  distribution: {
    client: 0,
    supplier: 0,
  },
  recentActivity: [],
};

export function useDashboardStats() {
  const [data, setData] = useState<StatisticsDashboard['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar si estamos en un entorno Electron
        if (typeof window.electron === 'undefined' || !window.electron.ipcRenderer) {
          setData(defaultStats);
          setLoading(false);
          return;
        }

        console.log('Solicitando estadísticas del dashboard...');
        const response = await window.electron.ipcRenderer.invoke("statistics:dashboard");
        console.log('Respuesta recibida:', response);
        const statsResponse = response as StatisticsDashboard;
        
        if (!statsResponse?.success) {
          // Construir mensaje de error con la información disponible
        const errorMessage = 'No se pudieron cargar las estadísticas del dashboard';
        const errorDetails = {
          response: statsResponse,
          timestamp: new Date().toISOString(),
          hasData: !!statsResponse.data,
          dataKeys: statsResponse.data ? Object.keys(statsResponse.data) : [],
          environment: {
            isElectron: typeof window.electron !== 'undefined',
            hasIpc: !!(window.electron?.ipcRenderer),
            userAgent: navigator.userAgent,
            online: navigator.onLine,
            timestamp: new Date().toISOString()
          }
        };
        
        console.error('❌ Error en la respuesta de estadísticas:', errorDetails);
        
        const error = new Error(errorMessage);
        (error as any).response = statsResponse;
        (error as any).details = errorDetails;
        throw error;
        }

        console.log('Estadísticas cargadas correctamente');
        setData(statsResponse.data);
      } catch (err) {
        if (!mounted) return;
        
        const error = err instanceof Error ? err : new Error('Error desconocido al cargar estadísticas');
        const errorInfo = {
          name: error.name,
          message: error.message,
          stack: error.stack,
          isElectronAvailable: typeof window.electron !== 'undefined',
          timestamp: new Date().toISOString(),
          // Incluir información de la respuesta si está disponible
          ...(error.hasOwnProperty('response') && { response: (error as any).response }),
          // Incluir detalles adicionales si están disponibles
          ...(error.hasOwnProperty('details') && { details: (error as any).details })
        };
        
        console.error('❌ Error al cargar estadísticas del dashboard:', errorInfo);
        
        setError(`Error: ${error.message}`);
        
        // Preparar metadatos para el evento de error
        const metadata: any = {
          originalError: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          environment: {
            isElectron: typeof window.electron !== 'undefined',
            hasIpc: !!(window.electron?.ipcRenderer),
            userAgent: navigator.userAgent,
            online: navigator.onLine,
            platform: navigator.platform
          }
        };
        
        // Añadir detalles adicionales si están disponibles
        if (error.hasOwnProperty('response')) {
          metadata.response = (error as any).response;
        }
        if (error.hasOwnProperty('details')) {
          metadata.details = (error as any).details;
        }
        
        // Informar sobre el error con más detalles
        window.dispatchEvent(new CustomEvent("api-error", {
          detail: {
            error: error.message,
            type: 'statistics-error',
            metadata: metadata
          }
        }));
        
        // Usar valores por defecto para permitir que la aplicación continúe
        console.warn('Usando valores por defecto para las estadísticas del dashboard');
        setData(defaultStats);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      mounted = false;
    };
  }, []);

  // Si no hay datos, usar valores por defecto
  const statsToShow = data || defaultStats;
  return { data: statsToShow, loading, error };
}
