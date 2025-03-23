<template>
  <div class="space-y-6">
    <div v-for="(notifications, category) in groupedNotifications" :key="category" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-text-primary dark:text-white capitalize">
          {{ formatCategory(category) }}
        </h3>
        <button
          v-if="hasUnreadInCategory(category)"
          class="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          @click="markCategoryAsRead(category)"
        >
          Mark all as read
        </button>
      </div>
      <div class="space-y-2">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="bg-surface dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
          :class="[
            notification.read ? 'opacity-75' : '',
            getNotificationClass(notification.type)
          ]"
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
                  <div class="flex items-center gap-2">
                    <time 
                      :datetime="notification.timestamp"
                      class="text-xs text-text-secondary dark:text-gray-400"
                    >
                      {{ formatTimestamp(notification.timestamp) }}
                    </time>
                    <button
                      type="button"
                      class="rounded-full p-1 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                      @click="removeNotification(notification.id)"
                      aria-label="Remove notification"
                    >
                      <i class="fas fa-times text-sm"></i>
                    </button>
                  </div>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="Object.keys(groupedNotifications).length === 0" class="text-center py-8">
      <div class="text-text-secondary dark:text-gray-400">
        <i class="fas fa-bell-slash text-3xl mb-2"></i>
        <p class="text-sm">No notifications to display</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '@/stores/notification';
import type { Notification, NotificationType } from '@/types/notification';

const notificationStore = useNotificationStore();

const groupedNotifications = computed(() => {
  return notificationStore.notificationsByCategory;
});

function formatCategory(category: string): string {
  return category === 'uncategorized' ? 'General' : category.toLowerCase();
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return '';
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

function hasUnreadInCategory(category: string): boolean {
  return (notificationStore.unreadCountByCategory[category] || 0) > 0;
}

function markCategoryAsRead(category: string) {
  notificationStore.markAllAsRead(category);
}

function removeNotification(id: string) {
  notificationStore.remove(id);
}

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
</script> 