<template>
  <Transition 
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-x-5"
    leave-active-class="transition-all duration-300 ease-in"
    leave-to-class="opacity-0 translate-x-5"
  >
    <div 
      v-if="show" 
      class="flex items-start p-4 rounded shadow-md mb-4 max-w-md relative border-l-4 transition-all"
      :class="[
        typeClasses,
        { 'pl-12': icon }
      ]"
    >
      <i v-if="icon" :class="['absolute left-4 top-4 text-lg', icon]"></i>
      <div class="flex-1 pr-4">
        <div v-if="title" class="font-semibold mb-1">{{ title }}</div>
        <div class="text-sm">
          <slot>{{ message }}</slot>
        </div>
      </div>
      <button 
        v-if="dismissible" 
        class="text-current opacity-70 p-1 -m-1 rounded hover:opacity-100 hover:bg-black/5 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1"
        :class="buttonRingClass"
        @click="dismiss"
        aria-label="Cerrar notificación"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  autoClose: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 5000
  },
  modelValue: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close', 'update:modelValue']);

// Estado interno
const show = ref(props.modelValue);

// Sincronizar estado con modelValue
watch(() => props.modelValue, (newVal) => {
  show.value = newVal;
});

// Emitir eventos cuando cambia show
watch(show, (newVal) => {
  emit('update:modelValue', newVal);
  if (!newVal) {
    emit('close');
  }
});

// Obtener las clases según el tipo de notificación
const typeClasses = computed(() => {
  switch(props.type) {
    case 'success':
      return 'bg-success/10 text-success-800 dark:text-success-300 border-success';
    case 'error':
      return 'bg-error/10 text-error-800 dark:text-error-300 border-error';
    case 'warning':
      return 'bg-warning/10 text-warning-800 dark:text-warning-300 border-warning';
    case 'info':
    default:
      return 'bg-info/10 text-info-800 dark:text-info-300 border-info';
  }
});

// Clases para el botón de cerrar
const buttonRingClass = computed(() => {
  switch(props.type) {
    case 'success': return 'focus:ring-success/50';
    case 'error': return 'focus:ring-error/50';
    case 'warning': return 'focus:ring-warning/50';
    case 'info':
    default: return 'focus:ring-info/50';
  }
});

// Cierre automático
onMounted(() => {
  if (props.autoClose && props.duration > 0) {
    setTimeout(() => {
      dismiss();
    }, props.duration);
  }
});

// Método para cerrar la notificación
const dismiss = () => {
  show.value = false;
};
</script>

<style scoped>
/* La mayoría de los estilos ahora están implementados con clases de Tailwind */
</style> 