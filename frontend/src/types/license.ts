export type LicenseStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_LICENSE' | 'ERROR';

export type LicenseType = 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';

export interface LicenseFeatures {
  maxUsers: number;
  maxContracts: number;
  maxStorage: number;
  allowedModules: string[];
  customFeatures?: Record<string, any>;
}

export interface License {
  id: string;
  licenseKey: string;
  type: LicenseType;
  active: boolean;
  startDate: string;
  expiryDate: string;
  customerName: string;
  message?: string;
  features: LicenseFeatures;
  metadata?: {
    renewalDate?: string;
    lastCheck?: string;
    activationDate?: string;
    environment?: string;
    version?: string;
  };
}

export interface LicenseResponse {
  status: LicenseStatus;
  message: string;
  license: License;
}

export interface LicenseActivationRequest {
  licenseCode: string;
  environment?: string;
  metadata?: Record<string, any>;
}

export interface LicenseRenewalRequest {
  licenseKey: string;
  period?: number; // en meses
  metadata?: Record<string, any>;
}

export interface LicenseHistoryEntry {
  id: string;
  licenseId: string;
  action: 'ACTIVATION' | 'RENEWAL' | 'EXPIRATION' | 'DEACTIVATION';
  timestamp: string;
  metadata?: Record<string, any>;
}