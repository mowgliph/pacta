<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="close">
        <div class="w-[90%] max-w-[600px] max-h-[90vh] bg-surface rounded shadow-md flex flex-col">
          <div class="p-3 border-b border-border flex items-center justify-between">
            <slot name="header"></slot>
            <button 
              class="bg-transparent border-none text-text-secondary cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors" 
              @click="close"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="p-3 overflow-y-auto">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="p-3 border-t border-border bg-gray-50 dark:bg-surface-hover">
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

<style>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>