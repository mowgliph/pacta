<template>
  <div class="fixed top-16 right-16 z-50 flex flex-col gap-8">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-in-out"
      enter-from-class="opacity-0 translate-x-8"
      leave-active-class="transition-all duration-300 ease-in-out"
      leave-to-class="opacity-0 translate-x-8"
    >
      <div
        v-for="toast in notifications"
        :key="toast.id"
        class="flex items-center gap-4 p-4 min-w-[300px] max-w-[500px] bg-surface rounded shadow-md"
        :class="[
          toast.type === 'success' ? 'border-l-4 border-success' : 
          toast.type === 'error' ? 'border-l-4 border-error' :
          toast.type === 'warning' ? 'border-l-4 border-warning' :
          'border-l-4 border-info'
        ]"
      >
        <div :class="[
          'text-xl',
          toast.type === 'success' ? 'text-success' : 
          toast.type === 'error' ? 'text-error' :
          toast.type === 'warning' ? 'text-warning' :
          'text-info'
        ]">
          <i :class="getIcon(toast.type)"></i>
        </div>
        <div class="flex-1">
          <p class="m-0 text-text-secondary text-sm">{{ toast.message }}</p>
        </div>
        <button 
          class="p-1 border-none bg-transparent text-text-secondary opacity-50 cursor-pointer transition-opacity hover:opacity-100" 
          @click="removeToast(toast.id)"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastNotificationStore } from '../../stores/toastNotification';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

type ToastType = 'success' | 'error' | 'warning' | 'info';

const notificationStore = useToastNotificationStore();
const { notifications } = storeToRefs(notificationStore);
const removeToast = notificationStore.removeNotification;

function getIcon(type: ToastType) {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  } as const;
  
  return icons[type];
}
</script>