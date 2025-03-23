import License from '../models/License.js';
import NotificationService from '../services/NotificationService.js';
import { Op } from 'sequelize';

class LicenseController {
  // Obtener el estado de la licencia actual
  async getLicenseStatus(req, res) {
    try {
      const license = await License.getCurrentLicense();
      
      if (!license) {
        await NotificationService.createLicenseNotification(
          req.user.id,
          'WARNING',
          'No valid license found. Please activate a license to continue.',
          { status: 'NO_LICENSE' }
        );

        return res.json({
          status: 'NO_LICENSE',
          message: 'No valid license found',
          license: null
        });
      }

      const daysUntilExpiry = Math.ceil((new Date(license.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      let status = 'VALID';
      let message = 'License is valid and active';

      if (!license.active) {
        status = 'ERROR';
        message = 'License is inactive';
        
        await NotificationService.createLicenseNotification(
          req.user.id,
          'ERROR',
          message,
          { status, licenseId: license.id }
        );
      } else if (daysUntilExpiry <= 0) {
        status = 'EXPIRED';
        message = 'License has expired';
        
        await NotificationService.createLicenseNotification(
          req.user.id,
          'EXPIRED',
          message,
          { status, licenseId: license.id }
        );
      } else if (daysUntilExpiry <= 30) {
        status = 'EXPIRING_SOON';
        message = `License will expire in ${daysUntilExpiry} days`;
        
        await NotificationService.createLicenseNotification(
          req.user.id,
          'EXPIRING_SOON',
          message,
          { status, licenseId: license.id, daysRemaining: daysUntilExpiry }
        );
      }

      res.json({
        status,
        message,
        license: {
          ...license.toJSON(),
          message
        }
      });
    } catch (error) {
      console.error('Error in getLicenseStatus:', error);
      res.status(500).json({
        status: 'ERROR',
        message: error.message,
        license: null
      });
    }
  }

  // Activar una nueva licencia
  async activateLicense(req, res) {
    try {
      const { licenseCode, environment, metadata = {} } = req.body;

      if (!licenseCode) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'License code is required',
          license: null
        });
      }

      let license = await License.findOne({
        where: { licenseKey: licenseCode }
      });

      if (!license) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Invalid license code',
          license: null
        });
      }

      if (!license.canActivate()) {
        await NotificationService.createLicenseNotification(
          req.user.id,
          'ERROR',
          'License cannot be activated: exceeded activation limit or expired',
          { status: 'ERROR', licenseId: license.id }
        );

        return res.status(400).json({
          status: 'ERROR',
          message: 'License cannot be activated: exceeded activation limit or expired',
          license: null
        });
      }

      license = await license.activate({
        environment,
        activationDate: new Date().toISOString(),
        ...metadata
      });

      await NotificationService.createLicenseNotification(
        req.user.id,
        'INFO',
        'License activated successfully',
        { status: 'VALID', licenseId: license.id }
      );

      res.json({
        status: 'VALID',
        message: 'License activated successfully',
        license
      });
    } catch (error) {
      console.error('Error in activateLicense:', error);
      res.status(500).json({
        status: 'ERROR',
        message: error.message,
        license: null
      });
    }
  }

  // Renovar una licencia existente
  async renewLicense(req, res) {
    try {
      const { licenseKey, period = 12 } = req.body; // periodo en meses

      const license = await License.findOne({
        where: { licenseKey }
      });

      if (!license) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'License not found',
          license: null
        });
      }

      const currentExpiry = new Date(license.expiryDate);
      const newExpiry = new Date(currentExpiry.setMonth(currentExpiry.getMonth() + period));
      
      license.expiryDate = newExpiry;
      license.metadata = {
        ...license.metadata,
        renewalDate: new Date().toISOString()
      };

      await license.save();

      await NotificationService.createLicenseNotification(
        req.user.id,
        'INFO',
        'License renewed successfully',
        { 
          status: 'VALID', 
          licenseId: license.id,
          newExpiryDate: newExpiry.toISOString()
        }
      );

      res.json({
        status: 'VALID',
        message: 'License renewed successfully',
        license
      });
    } catch (error) {
      console.error('Error in renewLicense:', error);
      res.status(500).json({
        status: 'ERROR',
        message: error.message,
        license: null
      });
    }
  }

  // Obtener historial de licencias
  async getLicenseHistory(req, res) {
    try {
      const licenses = await License.findAll({
        order: [['createdAt', 'DESC']]
      });

      res.json(licenses);
    } catch (error) {
      console.error('Error in getLicenseHistory:', error);
      res.status(500).json({
        message: error.message,
        licenses: []
      });
    }
  }

  // Subir una nueva licencia
  async uploadLicense(req, res) {
    try {
      const licenseData = req.body;

      if (!licenseData) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'No license data provided',
          license: null
        });
      }

      // Generar una clave única si no se proporciona
      if (!licenseData.licenseKey) {
        licenseData.licenseKey = await License.generateLicenseKey();
      }

      const license = await License.create(licenseData);

      await NotificationService.createLicenseNotification(
        req.user.id,
        'INFO',
        'New license uploaded successfully',
        { status: 'VALID', licenseId: license.id }
      );

      res.json({
        status: 'VALID',
        message: 'License uploaded successfully',
        license
      });
    } catch (error) {
      console.error('Error in uploadLicense:', error);
      res.status(500).json({
        status: 'ERROR',
        message: error.message,
        license: null
      });
    }
  }

  // Validar una licencia
  async validateLicense(req, res) {
    try {
      const { licenseKey } = req.params;

      const license = await License.findOne({
        where: { licenseKey }
      });

      if (!license) {
        return res.status(404).json({
          valid: false,
          message: 'License not found'
        });
      }

      const isValid = license.isValid();
      const isExpiringSoon = license.isExpiringSoon();

      license.lastValidated = new Date();
      await license.save();

      if (!isValid) {
        await NotificationService.createLicenseNotification(
          req.user.id,
          'ERROR',
          'License validation failed',
          { status: 'ERROR', licenseId: license.id }
        );
      } else if (isExpiringSoon) {
        await NotificationService.createLicenseNotification(
          req.user.id,
          'WARNING',
          'License is valid but expiring soon',
          { status: 'EXPIRING_SOON', licenseId: license.id }
        );
      }

      res.json({
        valid: isValid,
        expiringSoon: isExpiringSoon,
        message: isValid 
          ? isExpiringSoon 
            ? 'License is valid but expiring soon'
            : 'License is valid'
          : 'License is not valid'
      });
    } catch (error) {
      console.error('Error in validateLicense:', error);
      res.status(500).json({
        valid: false,
        message: error.message
      });
    }
  }
}

export default new LicenseController(); 