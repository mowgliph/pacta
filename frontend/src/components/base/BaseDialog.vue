<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="modelValue" class="dialog-overlay" @click.self="close">
        <div class="dialog">
          <div class="dialog__header">
            <slot name="header"></slot>
            <button class="dialog__close" @click="close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="dialog__body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="dialog__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

function close() {
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba($color-text-primary, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal;
}

.dialog {
  @include card-theme;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  &__header {
    padding: $spacing-unit * 3;
    border-bottom: 1px solid $color-border;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__body {
    padding: $spacing-unit * 3;
    overflow-y: auto;
  }

  &__footer {
    padding: $spacing-unit * 3;
    border-top: 1px solid $color-border;
    background: $color-surface-hover;
  }

  &__close {
    background: none;
    border: none;
    color: $color-text-secondary;
    cursor: pointer;
    padding: $spacing-unit;
    border-radius: $border-radius;
    
    &:hover {
      background: $color-surface-hover;
    }
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>