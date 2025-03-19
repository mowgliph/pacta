import { defineStore } from 'pinia';
import axios from 'axios';

type LicenseStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_LICENSE' | 'ERROR';

interface License {
  id: number;
  licenseKey: string;
  type: 'DEMO' | 'TRIAL' | 'FULL';
  startDate: string;
  expiryDate: string;
  active: boolean;
  maxUsers: number;
  features: Record<string, boolean>;
  metadata: Record<string, any>;
  message?: string;
  customerName?: string;
}

export const useLicenseStore = defineStore('license', {
  state: () => ({
    currentLicense: null as License | null,
    licenseStatus: 'NO_LICENSE' as LicenseStatus,
    loading: false,
    error: null as string | null
  }),

  getters: {
    isLicenseValid: (state) => {
      if (!state.currentLicense) return false;
      return state.currentLicense.active && new Date(state.currentLicense.expiryDate) > new Date();
    },

    daysUntilExpiration: (state) => {
      if (!state.currentLicense) return 0;
      const diff = new Date(state.currentLicense.expiryDate).getTime() - new Date().getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
  },

  actions: {
    async checkLicenseStatus() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/api/license-status');
        this.currentLicense = response.data;
        this.licenseStatus = response.data.status;
        return response.data;
      } catch (error) {
        this.error = 'Failed to check license status';
        this.licenseStatus = 'ERROR';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});