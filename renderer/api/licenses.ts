import { ApiResponse } from './common';

export interface License {
  id: string;
  number: string;
  status: LicenseStatus;
  // Agregar otros campos necesarios
}

export type LicenseStatus = 'active' | 'expired' | 'revoked' | 'pending';

export interface LicenseCreateData {
  number: string;
  // Otros campos necesarios para crear una licencia
}

export interface LicenseUpdateData {
  id: string;
  // Campos actualizables de la licencia
}

export interface LicenseAPI {
  validateLicense: (licenseData: string) => Promise<ApiResponse<License>>;
  getLicenseStatus: () => Promise<ApiResponse<LicenseStatus>>;
  revokeLicense: (licenseNumber: string) => Promise<ApiResponse<boolean>>;
  listLicenses: () => Promise<ApiResponse<License[]>>;
  getLicenseInfo: (licenseNumber: string) => Promise<ApiResponse<License>>;
}
