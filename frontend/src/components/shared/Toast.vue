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
@use '../../assets/styles/_variables.scss' as v;
@use '../../assets/styles/_colors.scss' as c;

.toast-container {
  position: fixed;
  top: v.$spacing-unit * 4;
  right: v.$spacing-unit * 4;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: v.$spacing-unit * 2;
}

.toast {
  display: flex;
  align-items: center;
  gap: v.$spacing-unit * 2;
  padding: v.$spacing-unit * 2;
  min-width: 300px;
  max-width: 500px;
  background: var(--color-surface);
  border-radius: v.$border-radius;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &--success {
    border-left: 4px solid var(--color-success);
    .toast__icon { color: var(--color-success); }
  }

  &--error {
    border-left: 4px solid var(--color-error);
    .toast__icon { color: var(--color-error); }
  }

  &--warning {
    border-left: 4px solid var(--color-warning);
    .toast__icon { color: var(--color-warning); }
  }

  &--info {
    border-left: 4px solid var(--color-info);
    .toast__icon { color: var(--color-info); }
  }

  &__icon {
    font-size: 1.25rem;
  }

  &__content {
    flex: 1;
  }

  &__message {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  &__close {
    padding: 4px;
    border: none;
    background: none;
    color: var(--color-text-secondary);
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