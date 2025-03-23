<template>
  <div class="notification-panel">
    <div class="notification-header">
      <h3>Notificaciones</h3>
      <div class="notification-actions">
        <button 
          v-if="hasUnread" 
          class="btn-text" 
          @click="markAllAsRead"
          :disabled="isLoading"
        >
          Marcar todo como leído
        </button>
        <button class="btn-icon" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div class="notification-content">
      <div v-if="isLoading" class="notification-loading">
        <i class="fas fa-circle-notch fa-spin"></i>
        <p>Cargando notificaciones...</p>
      </div>
      
      <div v-else-if="notifications.length === 0" class="notification-empty">
        <i class="fas fa-bell-slash"></i>
        <p>No tienes notificaciones</p>
      </div>
      
      <div v-else class="notification-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="notification-item"
          :class="{ 'is-unread': !notification.read }"
          @click="openNotificationDetails(notification)"
        >
          <div class="notification-icon" :class="notificationTypeClass(notification.type)">
            <i :class="notificationTypeIcon(notification.type)"></i>
          </div>
          
          <div class="notification-body">
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-meta">
              <span class="notification-time">{{ formatDate(notification.createdAt) }}</span>
              <span v-if="notification.Contract" class="notification-contract">
                {{ notification.Contract.contractNumber }}
              </span>
            </div>
          </div>
          
          <div class="notification-actions">
            <button 
              v-if="!notification.read" 
              class="btn-icon"
              title="Marcar como leída"
              @click.stop="markAsRead(notification.id)"
            >
              <i class="fas fa-check"></i>
            </button>
            <button 
              class="btn-icon"
              title="Eliminar notificación"
              @click.stop="deleteNotification(notification.id)"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="notification-footer">
      <router-link to="/notifications" class="view-all" @click="close">
        Ver todas las notificaciones
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

const props = defineProps<{
  onClose: () => void;
}>();

const router = useRouter();
const notificationStore = useNotificationStore();
const { notifications, loading: isLoading } = storeToRefs(notificationStore);
const hasUnread = computed(() => notificationStore.hasUnread);

onMounted(() => {
  notificationStore.fetchNotifications();
});

// Funciones para manejar notificaciones
const markAsRead = async (id: number) => {
  await notificationStore.markAsRead(id);
};

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

const deleteNotification = async (id: number) => {
  await notificationStore.deleteNotification(id);
};

const openNotificationDetails = async (notification: any) => {
  // Si no está leída, marcarla como leída
  if (!notification.read) {
    await markAsRead(notification.id);
  }
  
  // Si tiene ID de contrato, navegar al contrato
  if (notification.contractId) {
    router.push(`/contracts/${notification.contractId}`);
    close();
  }
};

// Funciones de utilidad
const close = () => {
  props.onClose();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Si es hoy, mostrar hace cuanto tiempo
  if (date.toDateString() === now.toDateString()) {
    return formatDistance(date, now, { 
      addSuffix: true,
      locale: es 
    });
  }
  
  // Si es dentro del último mes, mostrar el día y la hora
  if (now.getTime() - date.getTime() < 30 * 24 * 60 * 60 * 1000) {
    return format(date, 'dd MMM, HH:mm', { locale: es });
  }
  
  // Si es más antiguo, mostrar la fecha completa
  return format(date, 'dd/MM/yyyy', { locale: es });
};

const notificationTypeClass = (type: string) => {
  switch (type) {
    case 'EXPIRING_SOON': return 'is-warning';
    case 'EXPIRED': return 'is-danger';
    default: return 'is-info';
  }
};

const notificationTypeIcon = (type: string) => {
  switch (type) {
    case 'EXPIRING_SOON': return 'fas fa-clock';
    case 'EXPIRED': return 'fas fa-calendar-times';
    default: return 'fas fa-bell';
  }
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;

.notification-panel {
  background-color: v.$color-surface;
  border-radius: v.$border-radius;
  box-shadow: v.$shadow-lg;
  width: 360px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid v.$color-border;
}

.notification-header {
  padding: v.$spacing-md;
  border-bottom: 1px solid v.$color-border;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: v.$font-size-md;
    font-weight: v.$font-weight-medium;
  }
  
  .notification-actions {
    display: flex;
    align-items: center;
    gap: v.$spacing-sm;
  }
}

.notification-content {
  flex: 1;
  overflow-y: auto;
  padding: v.$spacing-sm 0;
  min-height: 200px;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  padding: v.$spacing-md;
  border-bottom: 1px solid rgba(v.$color-border, 0.5);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba(v.$color-primary, 0.05);
  }
  
  &.is-unread {
    background-color: rgba(v.$color-primary, 0.08);
    
    &:hover {
      background-color: rgba(v.$color-primary, 0.12);
    }
    
    .notification-message {
      font-weight: v.$font-weight-medium;
    }
  }
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: v.$spacing-md;
  flex-shrink: 0;
  
  &.is-info {
    background-color: rgba(c.$color-info, 0.1);
    color: c.$color-info;
  }
  
  &.is-warning {
    background-color: rgba(c.$color-warning, 0.1);
    color: c.$color-warning;
  }
  
  &.is-danger {
    background-color: rgba(c.$color-error, 0.1);
    color: c.$color-error;
  }
  
  i {
    font-size: v.$font-size-lg;
  }
}

.notification-body {
  flex: 1;
}

.notification-message {
  font-size: v.$font-size-sm;
  margin-bottom: v.$spacing-xs;
  color: v.$color-text-primary;
}

.notification-meta {
  display: flex;
  font-size: v.$font-size-xs;
  color: v.$color-text-secondary;
  
  .notification-time {
    margin-right: v.$spacing-sm;
  }
  
  .notification-contract {
    font-weight: v.$font-weight-medium;
    padding: 2px 6px;
    background-color: rgba(v.$color-primary, 0.1);
    border-radius: 4px;
  }
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: v.$spacing-xs;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  .notification-item:hover & {
    opacity: 1;
  }
}

.notification-loading,
.notification-empty {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: v.$color-text-secondary;
  
  i {
    font-size: 2rem;
    margin-bottom: v.$spacing-md;
    opacity: 0.5;
  }
}

.notification-footer {
  padding: v.$spacing-md;
  border-top: 1px solid v.$color-border;
  text-align: center;
  
  .view-all {
    color: v.$color-primary;
    text-decoration: none;
    font-size: v.$font-size-sm;
    font-weight: v.$font-weight-medium;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.btn-text {
  background: none;
  border: none;
  color: v.$color-primary;
  font-size: v.$font-size-sm;
  cursor: pointer;
  padding: v.$spacing-xs v.$spacing-sm;
  border-radius: v.$border-radius-sm;
  
  &:hover {
    background-color: rgba(v.$color-primary, 0.05);
  }
  
  &:disabled {
    color: v.$color-text-disabled;
    cursor: not-allowed;
  }
}

.btn-icon {
  background: none;
  border: none;
  color: v.$color-text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: v.$color-text-primary;
  }
}
</style> 