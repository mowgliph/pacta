<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast--${toast.type}`]"
      >
        <div class="toast__icon">
          <i :class="getIcon(toast.type)"></i>
        </div>
        <div class="toast__content">
          <p class="toast__message">{{ toast.message }}</p>
        </div>
        <button class="toast__close" @click="removeToast(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '../../stores/toast';
import { storeToRefs } from 'pinia';

type ToastType = 'success' | 'error' | 'warning' | 'info';

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);
const { removeToast } = toastStore;

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

<style lang="scss" scoped>
@use './Toast.scss';
</style>