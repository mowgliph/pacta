/**
 * Punto de entrada principal para PACTA Backend
 * Exporta los componentes principales para facilitar las importaciones
 */

// Configuración
export { default as config } from './config/app.config.js';

// Modelos
export * from './models/index.js';

// Servicios Core
export { LoggingService } from './services/LoggingService.js';
export { CacheService } from './services/CacheService.js';
export { ResponseService } from './services/ResponseService.js';
export { ValidationService } from './services/ValidationService.js';
export { default as NotificationService } from './services/NotificationService.js';

// Clases Base
export { BaseController } from './api/controllers/BaseController.js';
export { BaseService } from './services/BaseService.js';
export { BaseRepository } from './database/repositories/BaseRepository.js';
export { BaseRoute } from './api/routes/BaseRoute.js';

// Auth
export { authenticate, generateTokens, refreshToken } from './api/middleware/authMiddleware.js';
export { authorize, authorizeOwnership } from './api/middleware/authorizationMiddleware.js';

// Utils
export * from './utils/errors.js';

// Database
export { sequelize, db, testConnection, syncDatabase } from './database/dbconnection.js';

// Middleware
export { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';

// Server (por si se quiere importar la aplicación sin iniciarla)
export { default as app } from './server.js'; 