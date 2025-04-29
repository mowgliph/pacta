import { logger } from '../../utils/logger';
import { withErrorHandling } from '../setup';
import { ErrorHandler } from '../error-handler';
import { securityService } from '../../security/security-manager';

// Lista blanca de variables de entorno que se pueden solicitar desde el renderer
const ALLOWED_ENV_VARIABLES = [
  'JWT_SECRET',
  'API_URL',
  'APP_VERSION',
  'NODE_ENV'
];

/**
 * Configura los manejadores IPC para acceso seguro a variables de entorno
 */
export function setupEnvHandlers(): void {
  // Obtener una variable de entorno específica
  withErrorHandling('env:getVariable', async (_, key: string) => {
    // Verificar que la variable solicitada está en la lista blanca
    if (!key || typeof key !== 'string' || !ALLOWED_ENV_VARIABLES.includes(key)) {
      logger.warn(`Intento de acceso a variable de entorno no permitida: ${key}`);
      throw ErrorHandler.createError('AuthorizationError', 'Variable de entorno no accesible');
    }

    // Variables de entorno sensibles (secretos)
    if (key === 'JWT_SECRET') {
      try {
        // Usar el servicio de seguridad para obtener el secreto
        return securityService.getJwtSecret();
      } catch (error) {
        logger.error(`Error al obtener secreto: ${error}`);
        throw ErrorHandler.createError('UnknownError', 'Error al obtener variable de entorno');
      }
    }

    // Variables de entorno no sensibles
    return process.env[key];
  });

  logger.info('Manejadores de variables de entorno configurados');
} 