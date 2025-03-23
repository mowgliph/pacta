<template>
  <div class="bg-surface dark:bg-gray-800 rounded-lg shadow-sm p-4">
    <h3 class="text-text-primary dark:text-white font-semibold mb-4 flex items-center gap-2">
      Notifications
      <span v-if="unreadCount" class="bg-primary text-white py-0.5 px-2 rounded-full text-xs">{{ unreadCount }}</span>
    </h3>
    
    <div class="flex flex-col gap-3">
      <div v-for="notification in notifications" 
           :key="notification.id" 
           class="flex items-start gap-3 p-3 rounded-lg transition-colors"
           :class="{ 'bg-white dark:bg-gray-700 shadow-sm': !notification.read, 'bg-background/50 dark:bg-gray-800/80': notification.read }">
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center text-white"
          :class="{
            'bg-warning': notification.type === 'EXPIRING_SOON',
            'bg-error': notification.type === 'EXPIRED',
            'bg-info': notification.type === 'INFO',
            'bg-primary': !['EXPIRING_SOON', 'EXPIRED', 'INFO'].includes(notification.type)
          }">
          <i :class="getIconClass(notification.type)"></i>
        </div>
        
        <div class="flex-1">
          <p class="text-text-primary dark:text-gray-200 mb-1">{{ notification.message }}</p>
          <span class="text-sm text-text-secondary dark:text-gray-400">{{ formatTime(notification.createdAt) }}</span>
        </div>
        
        <button v-if="!notification.read" 
                @click="markAsRead(notification.id)"
                class="px-2 py-1 text-primary hover:text-primary-dark text-sm transition-colors">
          Mark as read
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '../../../stores/notification';

const notificationStore = useNotificationStore();
const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);

onMounted(async () => {
  await notificationStore.fetchNotifications();
});

function getIconClass(type: string) {
  const icons: Record<string, string> = {
    EXPIRING_SOON: 'fas fa-clock',
    EXPIRED: 'fas fa-exclamation-triangle',
    INFO: 'fas fa-info-circle'
  };
  return icons[type] || 'fas fa-bell';
}

function formatTime(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

async function markAsRead(id: number) {
  await notificationStore.markAsRead(id);
}
</script>