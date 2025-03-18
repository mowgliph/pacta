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
import { useToastStore } from '@/stores/toast';
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
.toast-container {
  position: fixed;
  top: $spacing-unit * 4;
  right: $spacing-unit * 4;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: $spacing-unit * 2;
}

.toast {
  display: flex;
  align-items: center;
  gap: $spacing-unit * 2;
  padding: $spacing-unit * 2;
  min-width: 300px;
  max-width: 500px;
  background: white;
  border-radius: $border-radius;
  box-shadow: $shadow-md;

  &--success {
    border-left: 4px solid #10B981;
    .toast__icon { color: #10B981; }
  }

  &--error {
    border-left: 4px solid #EF4444;
    .toast__icon { color: #EF4444; }
  }

  &--warning {
    border-left: 4px solid #F59E0B;
    .toast__icon { color: #F59E0B; }
  }

  &--info {
    border-left: 4px solid #3B82F6;
    .toast__icon { color: #3B82F6; }
  }

  &__icon {
    font-size: 1.25rem;
  }

  &__content {
    flex: 1;
  }

  &__message {
    margin: 0;
    font-size: 0.875rem;
  }

  &__close {
    padding: 4px;
    border: none;
    background: none;
    color: $color-text-secondary;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>