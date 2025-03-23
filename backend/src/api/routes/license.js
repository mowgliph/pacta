import { Router } from 'express';
import LicenseController from '../api/controllers/LicenseController.js';
import { authenticate } from '../api/middleware/auth.js';

const router = Router();

// Rutas públicas
router.post('/activate', LicenseController.activateLicense);
router.get('/validate/:licenseKey', LicenseController.validateLicense);

// Rutas protegidas
router.use(authenticate);
router.get('/status', LicenseController.getLicenseStatus);
router.get('/history', LicenseController.getLicenseHistory);
router.post('/renew', LicenseController.renewLicense);
router.post('/upload', LicenseController.uploadLicense);

export default router; 