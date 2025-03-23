<template>
  <div class="fixed top-5 right-5 z-[1000] max-w-sm flex flex-col items-end">
    <TransitionGroup name="notification-list">
      <BaseNotification
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        :type="notification.type"
        :message="notification.message"
        :title="notification.title"
        :icon="notification.icon || defaultIcon(notification.type)"
        :dismissible="true"
        :auto-close="notification.autoClose !== false"
        :duration="notification.duration || 5000"
        @close="notificationStore.removeNotification(notification.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseNotification from './base/BaseNotification.vue';
import { useToastNotificationStore } from '../stores/toastNotification';

// Usar el store de notificaciones
const notificationStore = useToastNotificationStore();

// Iconos por defecto
const defaultIcon = (type: string) => {
  switch (type) {
    case 'success': return 'fas fa-check-circle';
    case 'error': return 'fas fa-exclamation-circle';
    case 'warning': return 'fas fa-exclamation-triangle';
    case 'info': return 'fas fa-info-circle';
    default: return 'fas fa-bell';
  }
};
</script>

<style>
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.notification-list-enter-from,
.notification-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.notification-list-move {
  transition: transform 0.3s ease;
}
</style> 