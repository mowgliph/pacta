/**
 * Archivo central para exportar todos los controladores
 * Facilita la importación de controladores en otros archivos
 */

// Controladores base y utilidades
export { BaseController } from './BaseController.js';

// Controladores de entidades principales
export { default as AuthController } from './AuthController.js';
export { default as UserController } from './UserController.js';
export { CompanyController } from './CompanyController.js';
export { default as ContractController } from './ContractController.js';
export { NotificationController } from './NotificationController.js';

// Controladores de análisis y sistema
export { default as AnalyticsController } from './AnalyticsController.js';
export { default as DashboardController } from './DashboardController.js';
export { default as IndexController } from './IndexController.js';
export { default as LicenseController } from './LicenseController.js';
