import fs from 'fs/promises';
import { License } from '../models/index.js';
import { prisma } from '../database/prisma.js';


const TRIAL_CODES = {
  'TRYPATOOL': { days: 7, features: ['BASIC', 'REPORTS'] },
  'TRIALPATOOL': { days: 14, features: ['BASIC', 'REPORTS', 'ANALYTICS'] },
  'TRYFULL': { days: 30, features: ['BASIC', 'REPORTS', 'ANALYTICS', 'EXPORT'] },
};

/**
 * Servicio para validar licencias
 */
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

      // Check if license has expired
      if (this.isExpired(licenseData.expiryDate)) {
        throw new Error('License has expired');
      }

      // Create or update license in database
      const license = await License.create({
        licenseKey: licenseData.licenseKey,
        type: licenseData.type || 'FULL',
        userId: userId,
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
      await prisma.activityLog.create({
        data: {
          userId: userId,
          action: 'LICENSE_ACTIVATION',
          entityType: 'License',
          entityId: license.id,
          details: `License activated for ${licenseData.customerName}`
        }
      });

      return license;
    } catch (error) {
      throw new Error(`License validation failed: ${error.message}`);
    }
  }

  static isValidLicenseStructure(data) {
    const requiredFields = ['licenseKey', 'customerName', 'expiryDate', 'renewalDate'];
    return requiredFields.every(field => data[field]);
  }

  static isValidLicenseKey(key) {
    // Formato: LICENSE-timestamp-random
    const pattern = /^LICENSE-\d{13}-\d{4}$/;
    return pattern.test(key);
  }

  static isExpired(dateString) {
    const expiryDate = new Date(dateString);
    return expiryDate < new Date();
  }

  static async getCurrentLicenseStatus() {
    const license = await License.getCurrentLicense();
    if (!license) {
      return {
        isValid: false,
        status: 'NO_LICENSE',
        message: 'No valid license found',
        license: null,
      };
    }

    if (!license.isValid()) {
      return {
        isValid: false,
        status: 'EXPIRED',
        message: 'License has expired',
        expiryDate: license.expiryDate,
        license,
      };
    }

    if (license.isExpiringSoon()) {
      return {
        isValid: true,
        status: 'EXPIRING_SOON',
        message: 'License will expire soon',
        expiryDate: license.expiryDate,
        renewalDate: license.metadata.renewalDate,
        daysRemaining: Math.ceil(
          (new Date(license.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        ),
        license,
      };
    }

    return {
      isValid: true,
      status: 'VALID',
      message: 'License is valid',
      expiryDate: license.expiryDate,
      renewalDate: license.metadata.renewalDate,
      customerName: license.metadata.customerName,
      license,
    };
  }

  static async activateTrialWithCode(code, userId) {
    if (!TRIAL_CODES[code]) {
      throw new Error('Invalid trial code');
    }

    const { days, features } = TRIAL_CODES[code];

    // Check if the user already has a trial license
    const existingTrial = await License.findOne({
      where: {
        userId: userId,
        type: 'TRIAL',
      },
    });

    if (existingTrial) {
      throw new Error('User already has an active trial license');
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    // Create trial license
    const timestamp = Date.now();
    const randomKey = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const license = await License.create({
      licenseKey: `TRIAL-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type: 'TRIAL',
      userId: userId,
      expiryDate,
      active: true,
      maxUsers: 1,
      features: features || [],
      metadata: {
        trialCode: code,
        activationDate: new Date().toISOString(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'TRIAL_ACTIVATION',
        entityType: 'License',
        entityId: license.id,
        details: `Trial license activated with code ${code}`
      }
    });

    return {
      success: true,
      message: 'Trial license activated successfully',
      license: {
        type: license.type,
        expiryDate: license.expiryDate,
        days: days,
        features: features,
      },
    };
  }

  static async requiresFullLicense(feature) {
    // Check if the requested feature requires a full license
    const license = await License.getCurrentLicense();

    if (!license) {
      return {
        requiresUpgrade: true,
        status: 'NO_LICENSE',
        message: 'No active license found',
      };
    }

    if (license.type !== 'DEMO' && license.type !== 'TRIAL') {
      return {
        requiresUpgrade: false,
        status: 'FULL_LICENSE',
        message: 'Full license active',
      };
    }

    // For trial/demo licenses, check if the feature is included
    if (license.features && Array.isArray(license.features) && license.features.includes(feature)) {
      return {
        requiresUpgrade: false,
        status: 'FEATURE_INCLUDED',
        message: 'Feature included in current license',
      };
    }

    return {
      requiresUpgrade: true,
      status: 'FEATURE_REQUIRES_UPGRADE',
      message: 'This feature requires a full license',
    };
  }
}

export default LicenseValidator;
