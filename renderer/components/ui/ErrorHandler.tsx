import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ApiErrorEvent extends CustomEvent {
  detail: {
    error: string;
    type: string;
    metadata?: {
      channel?: string;
      timestamp?: string;
      originalError?: any;
      environment?: {
        isElectron?: boolean;
        hasIpc?: boolean;
        userAgent?: string;
        online?: boolean;
      };
      response?: {
        success?: boolean;
        data?: any;
        hasData?: boolean;
        hasUsers?: boolean;
        usersCount?: number;
        dataStructure?: {
          isObject?: boolean;
          hasUsers?: boolean;
          hasTotal?: boolean;
          usersType?: string;
        };
      };
    };
  };
}

interface ErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * Componente que maneja los errores globales de la aplicación
 * 
 * @component
 * @example
 * return (
 *   <ErrorHandler>
 *     <App />
 *   </ErrorHandler>
 * )
 */
export const ErrorHandler = ({ children }: ErrorHandlerProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleApiError = (event: ApiErrorEvent) => {
      const { type, error, metadata } = event.detail;
      
      // Log detallado del error
      console.group('📊 Error en la aplicación');
      console.log('🕒 Hora:', new Date().toISOString());
      console.log('🔍 Tipo de error:', type);
      console.log('📝 Mensaje:', error);
      
      // Mostrar información del entorno
      console.log('🌐 Entorno:', {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        electronAvailable: typeof window.electron !== 'undefined',
        ipcAvailable: !!window.electron?.ipcRenderer,
        online: navigator.onLine
      });
      
      if (metadata) {
        console.log('📂 Metadatos del error:', JSON.parse(JSON.stringify(metadata, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value 
        )));
        
        if (metadata.originalError) {
          console.error('❌ Error original:', metadata.originalError);
        }
        
        if (metadata.environment) {
          console.log('⚙️ Entorno en el momento del error:', metadata.environment);
        }
        
        if (metadata.response) {
          console.log('📥 Respuesta del servidor:', {
            success: metadata.response.success,
            hasData: metadata.response.data !== undefined,
            dataType: metadata.response.data ? typeof metadata.response.data : 'no-data',
            dataKeys: metadata.response.data ? Object.keys(metadata.response.data) : []
          });
        }
      }
      
      console.groupEnd();
      
      // Manejo específico de errores de estadísticas
      if (type === 'statistics-error') {
        console.warn('No se pudieron cargar las estadísticas. La aplicación continuará funcionando con funcionalidad limitada.');
        return;
      }
      
      // Navegación a la página de error para otros tipos de errores
      navigate("/error", {
        state: {
          error: error,
          type: type,
          metadata: metadata
        },
        replace: true
      });
    };

    // Agregar el event listener para errores de API
    window.addEventListener("api-error", handleApiError as EventListener);
    
    // Manejo de errores no capturados
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Error no manejado en promesa:', event.reason);
      
      const errorEvent = new CustomEvent("api-error", {
        detail: { 
          error: event.reason?.message || 'Error desconocido en promesa',
          type: 'unhandled-rejection',
          metadata: {
            originalError: event.reason,
            timestamp: new Date().toISOString()
          }
        }
      });
      
      window.dispatchEvent(errorEvent);
    };
    
    const handleError = (event: ErrorEvent) => {
      console.error('Error no manejado:', event.error);
      
      const errorEvent = new CustomEvent("api-error", {
        detail: { 
          error: event.message || 'Error desconocido',
          type: 'unhandled-error',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            timestamp: new Date().toISOString()
          }
        }
      });
      
      window.dispatchEvent(errorEvent);
    };
    
    // Agregar listeners para errores no capturados
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    // Limpieza
    return () => {
      window.removeEventListener("api-error", handleApiError as EventListener);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [navigate]);

  return <>{children}</>;
};

export default ErrorHandler;
