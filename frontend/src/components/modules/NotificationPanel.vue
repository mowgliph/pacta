<template>
  <div class="bg-surface rounded-md shadow-lg w-[360px] max-h-[480px] flex flex-col overflow-hidden border border-border">
    <div class="p-4 border-b border-border flex justify-between items-center">
      <h3 class="m-0 text-base font-medium">Notificaciones</h3>
      <div class="flex items-center gap-2">
        <button 
          v-if="hasUnread" 
          class="bg-transparent border-none text-primary text-sm cursor-pointer px-2 py-1 rounded hover:bg-primary/5 disabled:text-text-disabled disabled:cursor-not-allowed" 
          @click="markAllAsRead"
          :disabled="isLoading"
        >
          Marcar todo como leído
        </button>
        <button class="bg-transparent border-none text-text-secondary flex items-center justify-center w-7 h-7 rounded-full cursor-pointer hover:bg-black/5 hover:text-text-primary" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto py-2 min-h-[200px]">
      <div v-if="isLoading" class="h-[200px] flex flex-col items-center justify-center text-text-secondary">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-4 opacity-50"></i>
        <p>Cargando notificaciones...</p>
      </div>
      
      <div v-else-if="notifications.length === 0" class="h-[200px] flex flex-col items-center justify-center text-text-secondary">
        <i class="fas fa-bell-slash text-3xl mb-4 opacity-50"></i>
        <p>No tienes notificaciones</p>
      </div>
      
      <div v-else class="flex flex-col">
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="flex p-4 border-b border-border/50 cursor-pointer transition-colors last:border-b-0"
          :class="{ 'bg-primary/8 hover:bg-primary/12': !notification.read, 'hover:bg-primary/5': notification.read }"
          @click="openNotificationDetails(notification)"
        >
          <div class="w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
               :class="{
                 'bg-info/10 text-info': notificationTypeClass(notification.type) === 'is-info',
                 'bg-warning/10 text-warning': notificationTypeClass(notification.type) === 'is-warning',
                 'bg-error/10 text-error': notificationTypeClass(notification.type) === 'is-danger'
               }">
            <i :class="notificationTypeIcon(notification.type)" class="text-lg"></i>
          </div>
          
          <div class="flex-1">
            <div class="text-sm mb-1 text-text-primary" :class="{ 'font-medium': !notification.read }">
              {{ notification.message }}
            </div>
            <div class="flex text-xs text-text-secondary">
              <span class="mr-2">{{ formatDate(notification.createdAt) }}</span>
              <span v-if="notification.Contract" class="font-medium py-0.5 px-1.5 bg-primary/10 rounded">
                {{ notification.Contract.contractNumber }}
              </span>
            </div>
          </div>
          
          <div class="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button 
              v-if="!notification.read" 
              class="bg-transparent border-none text-text-secondary flex items-center justify-center w-7 h-7 rounded-full cursor-pointer hover:bg-black/5 hover:text-text-primary"
              title="Marcar como leída"
              @click.stop="markAsRead(notification.id)"
            >
              <i class="fas fa-check"></i>
            </button>
            <button 
              class="bg-transparent border-none text-text-secondary flex items-center justify-center w-7 h-7 rounded-full cursor-pointer hover:bg-black/5 hover:text-text-primary"
              title="Eliminar notificación"
              @click.stop="deleteNotification(notification.id)"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="p-4 border-t border-border text-center">
      <router-link to="/notifications" class="text-primary no-underline text-sm font-medium hover:underline" @click="close">
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