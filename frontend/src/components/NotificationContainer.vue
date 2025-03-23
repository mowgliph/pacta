<template>
  <div class="fixed top-0 right-0 z-50 p-4 space-y-4 max-w-md w-full pointer-events-none">
    <TransitionGroup 
      name="notification" 
      tag="div" 
      class="space-y-2"
    >
      <div
        v-for="notification in notificationStore.sortedNotifications"
        :key="notification.id"
        class="notification-item pointer-events-auto bg-surface dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl"
        :class="[getNotificationClass(notification.type)]"
        role="alert"
        aria-live="polite"
      >
        <div class="p-4">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 notification-icon-wrapper rounded-full p-2" :class="getNotificationWrapperClass(notification.type)">
              <i :class="getNotificationIcon(notification.type)" class="text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <p class="text-sm font-semibold text-text-primary dark:text-white line-clamp-2">
                  {{ notification.title }}
                </p>
                <button
                  type="button"
                  class="ml-2 flex-shrink-0 rounded-full p-1 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  @click="closeNotification(notification.id)"
                  aria-label="Close notification"
                >
                  <i class="fas fa-times text-sm"></i>
                </button>
              </div>
              <p class="mt-1 text-sm text-text-secondary dark:text-gray-300 line-clamp-3">
                {{ notification.message }}
              </p>
              <div v-if="notification.action" class="mt-3 flex items-center gap-2">
                <RouterLink
                  :to="notification.action.route"
                  class="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  {{ notification.action.label }}
                </RouterLink>
                <span v-if="notification.category" class="text-xs px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                  {{ notification.category }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div 
          v-if="!notification.persistent && notification.timeout"
          class="h-1 bg-primary-50 dark:bg-primary-900"
        >
          <div
            class="h-full transition-all duration-300 ease-linear"
            :class="getProgressBarClass(notification.type)"
            :style="{ width: getProgressWidth(notification) }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification';
import type { Notification, NotificationType } from '@/types/notification';
import { ref, onMounted } from 'vue';

const notificationStore = useNotificationStore();
const timeouts = ref<Record<string, number>>({});

onMounted(() => {
  // Limpiar timeouts al desmontar
  return () => {
    Object.values(timeouts.value).forEach(timeout => clearTimeout(timeout));
  };
});

function getNotificationClass(type: NotificationType): string {
  return {
    info: 'border-l-4 border-info bg-info-50/30 dark:bg-info-900/10',
    success: 'border-l-4 border-success bg-success-50/30 dark:bg-success-900/10',
    warning: 'border-l-4 border-warning bg-warning-50/30 dark:bg-warning-900/10',
    error: 'border-l-4 border-error bg-error-50/30 dark:bg-error-900/10'
  }[type] || '';
}

function getNotificationWrapperClass(type: NotificationType): string {
  return {
    info: 'bg-info-100 dark:bg-info-900',
    success: 'bg-success-100 dark:bg-success-900',
    warning: 'bg-warning-100 dark:bg-warning-900',
    error: 'bg-error-100 dark:bg-error-900'
  }[type] || '';
}

function getNotificationIcon(type: NotificationType): string {
  return {
    info: 'fas fa-info text-info-600 dark:text-info-400',
    success: 'fas fa-check text-success-600 dark:text-success-400',
    warning: 'fas fa-exclamation text-warning-600 dark:text-warning-400',
    error: 'fas fa-times text-error-600 dark:text-error-400'
  }[type] || '';
}

function getProgressBarClass(type: NotificationType): string {
  return {
    info: 'bg-info-500 dark:bg-info-400',
    success: 'bg-success-500 dark:bg-success-400',
    warning: 'bg-warning-500 dark:bg-warning-400',
    error: 'bg-error-500 dark:bg-error-400'
  }[type] || '';
}

function closeNotification(id: string) {
  notificationStore.remove(id);
  if (timeouts.value[id]) {
    clearTimeout(timeouts.value[id]);
    delete timeouts.value[id];
  }
}

function getProgressWidth(notification: Notification): string {
  if (!notification.timeout) return '0%';
  const elapsed = Date.now() - new Date(notification.timestamp || '').getTime();
  const progress = Math.max(0, 100 - (elapsed / notification.timeout) * 100);
  return `${progress}%`;
}
</script>

<style scoped>
.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px) translateY(-10px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.notification-item {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style> 