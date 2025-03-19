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
import { useNotificationStore } from '@/stores/notification';

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
@import '../../../assets/main.scss';

.notification-panel {
  background: var(--color-surface);
  border-radius: $border-radius;
  padding: $spacing-md;
  
  &__title {
    color: var(--color-text-primary);
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-md;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }
}

.notification-badge {
  background: $color-accent;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: $font-size-xs;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-sm;
  border-radius: $border-radius;
  background: rgba(var(--color-background), 0.5);
  transition: background-color 0.2s;

  &--unread {
    background: white;
    box-shadow: $shadow-sm;
  }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-accent;
    color: white;

    &--warning {
      background: #F59E0B;
    }

    &--danger {
      background: #EF4444;
    }

    &--info {
      background: #3B82F6;
    }
  }

  &__content {
    flex: 1;
  }

  &__message {
    color: var(--color-text-primary);
    margin-bottom: $spacing-xs;
  }

  &__time {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }

  &__action {
    padding: 4px 8px;
    border: none;
    background: none;
    color: $color-accent;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>