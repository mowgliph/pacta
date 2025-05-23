import { useState, useCallback, useEffect } from 'react';
import type { License, LicenseStatus } from '@/types/electron.d.ts';
import type { ApiResponse } from '@/types/electron.d.ts';

// Función auxiliar para convertir License a LicenseStatus
function convertToLicenseStatus(data: License | LicenseStatus): LicenseStatus {
  return {
    valid: 'valid' in data ? data.valid : true,
    type: 'type' in data ? data.type : data.licenseType || 'No especificado',
    expiryDate: data.expiryDate || '',
    features: 'features' in data ? data.features : [],
    licenseNumber: data.licenseNumber,
    companyName: data.companyName,
    contactName: data.contactName,
    email: data.email,
    issueDate: data.issueDate,
    signature: data.signature,
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

export function useLicense() {
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLicenseStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await window.electron.license.getLicenseStatus();
      if (status.success && status.data) {
        const licenseStatus = convertToLicenseStatus(status.data);
        setLicenseStatus(licenseStatus);
        return licenseStatus;
      }
      setError(status.error?.message || 'Error al obtener el estado de la licencia');
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener el estado de la licencia');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getLicenseStatus();
  }, [getLicenseStatus]);

  const validateLicense = useCallback(async (licenseData: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await window.electron.license.validateLicense(licenseData);
      if (result.success && result.data) {
        const licenseStatus = convertToLicenseStatus(result.data);
        setLicenseStatus(licenseStatus);
        return licenseStatus;
      }
      setError(result.error?.message || 'Error al validar la licencia');
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al validar la licencia');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeLicense = useCallback(async (licenseNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await window.electron.license.revokeLicense(licenseNumber);
      if (result.success) {
        setLicenseStatus(null);
        return true;
      }
      setError(result.error?.message || 'Error al revocar la licencia');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al revocar la licencia');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportLicenseInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!licenseStatus?.licenseNumber) {
        throw new Error('No hay licencia activa para exportar');
      }
      const result = await window.electron.license.getLicenseInfo(licenseStatus.licenseNumber);
      if (result.success && result.data) {
        return result.data;
      }
      setError(result.error?.message || 'Error al exportar la información de la licencia');
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar la información de la licencia');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [licenseStatus]);

  return {
    licenseStatus,
    error,
    isLoading,
    validateLicense,
    getLicenseStatus,
    revokeLicense,
    exportLicenseInfo
  };
}
