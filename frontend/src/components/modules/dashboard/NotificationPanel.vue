<template>
  <div class="notification-panel">
    <h3 class="notification-panel__title">
      Notifications
      <span v-if="unreadCount" class="notification-badge">{{ unreadCount }}</span>
    </h3>
    
    <div class="notification-list">
      <div v-for="notification in notifications" 
           :key="notification.id" 
           class="notification-item"
           :class="{ 'notification-item--unread': !notification.read }">
        <div class="notification-item__icon" :class="getNotificationIcon(notification.type)">
          <i :class="getIconClass(notification.type)"></i>
        </div>
        
        <div class="notification-item__content">
          <p class="notification-item__message">{{ notification.message }}</p>
          <span class="notification-item__time">{{ formatTime(notification.createdAt) }}</span>
        </div>
        
        <button v-if="!notification.read" 
                @click="markAsRead(notification.id)"
                class="notification-item__action">
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

function getNotificationIcon(type: string) {
  return {
    'notification-item__icon--warning': type === 'EXPIRING_SOON',
    'notification-item__icon--danger': type === 'EXPIRED',
    'notification-item__icon--info': type === 'INFO'
  };
}

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

<style lang="scss" scoped>
@use './notificationPanel.scss';
</style>