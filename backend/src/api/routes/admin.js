/**
 * Rutas de administración de la API (requieren autenticación y rol de admin)
 */
import express from 'express';
import { authorize } from '../middleware/authorizationMiddleware.js';
import { sensitiveRouteLimiter } from '../middleware/rateLimit.js';
import UserController from '../controllers/UserController.js';
import SystemController from '../controllers/SystemController.js';
import LicenseController from '../controllers/LicenseController.js';

const router = express.Router();

// Instanciar controladores
const userController = new UserController();
const systemController = new SystemController();
const licenseController = new LicenseController();

// Todas las rutas de este router requieren rol de administrador
router.use(authorize('ADMIN'));

// Rutas de gestión de usuarios
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', sensitiveRouteLimiter, userController.createUser);
router.put('/users/:id', sensitiveRouteLimiter, userController.updateUser);
router.delete('/users/:id', sensitiveRouteLimiter, userController.deleteUser);
router.put('/users/:id/status', sensitiveRouteLimiter, userController.updateUserStatus);
router.put('/users/:id/role', sensitiveRouteLimiter, userController.updateUserRole);

// Rutas de gestión de licencias
router.get('/licenses', licenseController.getAllLicenses);
router.get('/licenses/:id', licenseController.getLicenseById);
router.post('/licenses', sensitiveRouteLimiter, licenseController.createLicense);
router.put('/licenses/:id', sensitiveRouteLimiter, licenseController.updateLicense);
router.delete('/licenses/:id', sensitiveRouteLimiter, licenseController.deleteLicense);
router.post('/licenses/generate', sensitiveRouteLimiter, licenseController.generateLicenseKey);
router.post('/licenses/activate', licenseController.activateLicense);
router.post('/licenses/deactivate', licenseController.deactivateLicense);

// Rutas de sistema
router.get('/system/stats', systemController.getSystemStats);
router.get('/system/logs', systemController.getSystemLogs);
router.post('/system/cache/clear', sensitiveRouteLimiter, systemController.clearCache);
router.post('/system/backup', sensitiveRouteLimiter, systemController.createBackup);
router.get('/system/backup/list', systemController.listBackups);
router.get('/system/backup/:filename', systemController.downloadBackup);

export default router;
