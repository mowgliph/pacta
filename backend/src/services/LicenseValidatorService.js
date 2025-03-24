import fs from 'fs/promises';
import path from 'path';
import { License, ActivityLog } from '../models/associations.js';

const TRIAL_CODES = {
  DEMOPACTA: {
    days: 30,
    type: 'DEMO',
  },
  TRYPACTA: {
    days: 14,
    type: 'TRIAL',
  },
};

class LicenseValidator {
  static async validateLicenseFile(filePath, userId) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const licenseData = JSON.parse(fileContent);

      // Validate license structure
      if (!this.isValidLicenseStructure(licenseData)) {
        throw new Error('Invalid license file structure');
      }

      // Validate license key format (14 digits)
      if (!this.isValidLicenseKey(licenseData.licenseKey)) {
        throw new Error('Invalid license key format');
      }

      // Check expiration
      if (this.isExpired(licenseData.expiryDate)) {
        throw new Error('License has expired');
      }

      // Create or update license in database
      const license = await License.create({
        licenseKey: licenseData.licenseKey,
        type: licenseData.type || 'FULL',
        startDate: new Date(),
        expiryDate: new Date(licenseData.expiryDate),
        active: true,
        maxUsers: licenseData.maxUsers || 1,
        features: licenseData.features || {},
        metadata: {
          customerName: licenseData.customerName,
          renewalDate: licenseData.renewalDate,
        },
      });

      // Log the license activation
      await ActivityLog.create({
        userId,
        action: 'LICENSE_ACTIVATION',
        entityType: 'License',
        entityId: license.id,
        details: `License activated for ${licenseData.customerName}`,
      });

      return license;
    } catch (error) {
      throw new Error(`License validation failed: ${error.message}`);
    }
  }

  static isValidLicenseStructure(data) {
    const requiredFields = ['licenseKey', 'customerName', 'expiryDate', 'renewalDate'];
    return requiredFields.every(field => data.hasOwnProperty(field));
  }

  static isValidLicenseKey(key) {
    return /^\d{14}$/.test(key);
  }

  static isExpired(expiryDate) {
    return new Date(expiryDate) <= new Date();
  }

  static async getCurrentLicenseStatus() {
    const license = await License.getCurrentLicense();
    if (!license) {
      return {
        isValid: false,
        status: 'NO_LICENSE',
        message: 'No valid license found',
      };
    }

    if (!license.isValid()) {
      return {
        isValid: false,
        status: 'EXPIRED',
        message: 'License has expired',
        expiryDate: license.expiryDate,
      };
    }

    if (license.isExpiringSoon()) {
      return {
        isValid: true,
        status: 'EXPIRING_SOON',
        message: 'License will expire soon',
        expiryDate: license.expiryDate,
        renewalDate: license.metadata.renewalDate,
      };
    }

    return {
      isValid: true,
      status: 'VALID',
      message: 'License is valid',
      expiryDate: license.expiryDate,
      renewalDate: license.metadata.renewalDate,
      customerName: license.metadata.customerName,
    };
  }

  static async validateTrialCode(code, userId) {
    try {
      // Validate code format
      const trialCode = TRIAL_CODES[code.toUpperCase()];
      if (!trialCode) {
        throw new Error('Invalid trial code');
      }

      // Check if code was already used
      const existingTrial = await License.findOne({
        where: {
          metadata: {
            trialCode: code.toUpperCase(),
          },
        },
      });

      if (existingTrial) {
        throw new Error('Trial code has already been used');
      }

      // Create trial license
      const now = new Date();
      const expiryDate = new Date(now.setDate(now.getDate() + trialCode.days));

      const license = await License.create({
        licenseKey: `TRIAL-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: trialCode.type,
        startDate: new Date(),
        expiryDate,
        active: true,
        maxUsers: 1,
        features: {
          fullAccess: true,
        },
        metadata: {
          trialCode: code.toUpperCase(),
          customerName: 'Trial User',
          renewalDate: expiryDate,
        },
      });

      // Log the trial activation
      await ActivityLog.create({
        userId,
        action: 'TRIAL_ACTIVATION',
        entityType: 'License',
        entityId: license.id,
        details: `Trial license activated with code ${code}`,
      });

      return {
        success: true,
        license: {
          type: license.type,
          expiryDate: license.expiryDate,
          daysRemaining: trialCode.days,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async checkTrialStatus(userId) {
    const license = await License.getCurrentLicense();

    if (!license) {
      return {
        status: 'NO_TRIAL',
        message: 'No active trial found',
      };
    }

    if (license.type !== 'DEMO' && license.type !== 'TRIAL') {
      return {
        status: 'FULL_LICENSE',
        message: 'Full license active',
      };
    }

    const now = new Date();
    const daysRemaining = Math.ceil((new Date(license.expiryDate) - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return {
        status: 'EXPIRED',
        message: 'Trial period has expired',
        expiryDate: license.expiryDate,
      };
    }

    return {
      status: 'ACTIVE',
      message: `Trial active - ${daysRemaining} days remaining`,
      type: license.type,
      expiryDate: license.expiryDate,
      daysRemaining,
    };
  }
}

export default LicenseValidator;
