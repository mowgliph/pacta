import { defineStore } from 'pinia';
import type { License, LicenseStatus } from '@/types/license';
import { NotificationService } from '@/services/NotificationService';
import api from '@/services/api';

interface LicenseState {
  currentLicense: License | null;
  licenseStatus: LicenseStatus;
  loading: boolean;
  error: string | null;
}

export const useLicenseStore = defineStore('license', {
  state: (): LicenseState => ({
    currentLicense: null,
    licenseStatus: 'NO_LICENSE',
    loading: false,
    error: null
  }),

  getters: {
    isValid: (state) => state.licenseStatus === 'VALID',
    isExpiringSoon: (state) => state.licenseStatus === 'EXPIRING_SOON',
    isExpired: (state) => state.licenseStatus === 'EXPIRED',
    hasError: (state) => state.licenseStatus === 'ERROR',
    daysUntilExpiry: (state) => {
      if (!state.currentLicense?.expiryDate) return null;
      const now = new Date();
      const expiry = new Date(state.currentLicense.expiryDate);
      const diff = expiry.getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
  },

  actions: {
    async checkLicenseStatus() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/api/license/status');
        const { status, message, license } = response.data;

        this.licenseStatus = status;
        this.currentLicense = license;

        // Manejar notificaciones según el estado
        if (status === 'EXPIRING_SOON' && this.daysUntilExpiry) {
          NotificationService.notifyLicenseExpiringSoon(this.daysUntilExpiry);
        } else if (status === 'EXPIRED') {
          NotificationService.notifyLicenseExpired();
        }

        return { status, message };
      } catch (error) {
        this.error = 'Error checking license status';
        this.licenseStatus = 'ERROR';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async activateLicense(licenseCode: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/api/license/activate', {
          licenseCode,
          environment: import.meta.env.MODE,
          metadata: {
            activationDate: new Date().toISOString(),
            version: import.meta.env.VITE_APP_VERSION
          }
        });

        const { status, message, license } = response.data;

        if (status === 'VALID') {
          this.licenseStatus = status;
          this.currentLicense = license;
          NotificationService.notifyLicenseActivated();
        } else {
          throw new Error(message);
        }

        return { status, message };
      } catch (error) {
        this.error = 'Error activating license';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async renewLicense() {
      if (!this.currentLicense?.licenseKey) {
        throw new Error('No license to renew');
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/api/license/renew', {
          licenseKey: this.currentLicense.licenseKey
        });

        const { status, message, license } = response.data;

        if (status === 'VALID') {
          this.licenseStatus = status;
          this.currentLicense = license;
          NotificationService.clearLicenseNotifications();
        } else {
          throw new Error(message);
        }

        return { status, message };
      } catch (error) {
        this.error = 'Error renewing license';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.currentLicense = null;
      this.licenseStatus = 'NO_LICENSE';
      this.loading = false;
      this.error = null;
      NotificationService.clearLicenseNotifications();
    }
  }
});