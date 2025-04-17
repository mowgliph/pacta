import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationApi from '../services/notificationService';

export function useNotifications() {
  const queryClient = useQueryClient();

  // Obtener notificaciones
  const notificationsQuery = useQuery(['notifications'], notificationApi.getNotifications);

  // Marcar una notificación como leída
  const markReadMutation = useMutation(notificationApi.markNotificationRead, {
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  // Marcar todas como leídas
  const markAllReadMutation = useMutation(notificationApi.markAllNotificationsRead, {
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    refetch: notificationsQuery.refetch,
    markNotificationRead: markReadMutation.mutate,
    markAllNotificationsRead: markAllReadMutation.mutate,
    isMarkingRead: markReadMutation.isLoading || markAllReadMutation.isLoading
  };
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  // Obtener preferencias
  const preferencesQuery = useQuery(['notificationPreferences'], notificationApi.getNotificationPreferences);

  // Actualizar preferencia
  const updatePreferenceMutation = useMutation(
    ({ type, data }: { type: string; data: { email: boolean; inApp: boolean; system: boolean } }) =>
      notificationApi.updateNotificationPreference(type, data),
    {
      onSuccess: () => queryClient.invalidateQueries(['notificationPreferences'])
    }
  );

  return {
    preferences: preferencesQuery.data || [],
    isLoading: preferencesQuery.isLoading,
    refetch: preferencesQuery.refetch,
    updatePreference: updatePreferenceMutation.mutate,
    isUpdating: updatePreferenceMutation.isLoading
  };
}
