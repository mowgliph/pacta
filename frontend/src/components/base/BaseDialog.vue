<template>
  <Teleport to="body">
    <Transition 
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click.self="close">
        <div 
          class="w-[90%] max-w-[600px] max-h-[90vh] bg-surface dark:bg-gray-800 rounded-lg shadow-lg flex flex-col transform transition-transform duration-300"
          :class="[size === 'lg' ? 'max-w-[800px]' : size === 'sm' ? 'max-w-[400px]' : 'max-w-[600px]']"
        >
          <div class="p-4 border-b border-border dark:border-gray-700 flex items-center justify-between">
            <slot name="header"></slot>
            <button 
              class="icon-button icon-button-secondary" 
              @click="close"
              aria-label="Cerrar diálogo"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="p-4 overflow-y-auto scrollbar-hide">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="p-4 border-t border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  }
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
/* Las transiciones ahora se manejan con clases de Tailwind */
</style>