import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as systemSettingsService from '../services/systemSettingsService';

export function useBackupSchedule() {
  const queryClient = useQueryClient();
  const query = useQuery(['backupSchedule'], systemSettingsService.getBackupSchedule);
  const mutation = useMutation(systemSettingsService.updateBackupSchedule, {
    onSuccess: () => queryClient.invalidateQueries(['backupSchedule'])
  });
  return {
    ...query,
    updateBackupSchedule: mutation.mutate,
    isUpdating: mutation.isLoading
  };
}

export function useSmtpConfig() {
  const queryClient = useQueryClient();
  const query = useQuery(['smtpConfig'], systemSettingsService.getSmtpConfig);
  const updateMutation = useMutation(systemSettingsService.updateSmtpConfig, {
    onSuccess: () => queryClient.invalidateQueries(['smtpConfig'])
  });
  const testMutation = useMutation(systemSettingsService.testSmtpConfig);
  return {
    ...query,
    updateSmtpConfig: updateMutation.mutate,
    isUpdating: updateMutation.isLoading,
    testSmtpConfig: testMutation.mutateAsync,
    isTesting: testMutation.isLoading,
    testResult: testMutation.data,
    testError: testMutation.error
  };
}

export function usePublicDashboardStatus() {
  const queryClient = useQueryClient();
  const query = useQuery(['publicDashboardStatus'], systemSettingsService.getPublicDashboardStatus);
  const mutation = useMutation(systemSettingsService.updatePublicDashboardStatus, {
    onSuccess: () => queryClient.invalidateQueries(['publicDashboardStatus'])
  });
  return {
    ...query,
    updatePublicDashboardStatus: mutation.mutate,
    isUpdating: mutation.isLoading
  };
}
