<template>
  <Transition name="notification">
    <div 
      v-if="show" 
      class="base-notification" 
      :class="[
        `base-notification--${type}`,
        { 'base-notification--with-icon': icon }
      ]"
    >
      <i v-if="icon" :class="['base-notification__icon', icon]"></i>
      <div class="base-notification__content">
        <div v-if="title" class="base-notification__title">{{ title }}</div>
        <div class="base-notification__message">
          <slot>{{ message }}</slot>
        </div>
      </div>
      <button 
        v-if="dismissible" 
        class="base-notification__close"
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

// Iconos por defecto según el tipo
const defaultIcon = computed(() => {
  if (!props.icon) {
    switch (props.type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return '';
    }
  }
  return props.icon;
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

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;

.base-notification {
  display: flex;
  align-items: flex-start;
  padding: v.$spacing-md v.$spacing-lg;
  border-radius: v.$border-radius;
  position: relative;
  box-shadow: v.$shadow-md;
  margin-bottom: v.$spacing-md;
  transition: all v.$transition-normal;
  max-width: 400px;
  
  &--with-icon {
    padding-left: v.$spacing-lg + 30px;
  }
  
  &__icon {
    position: absolute;
    left: v.$spacing-md;
    top: v.$spacing-md;
    font-size: v.$font-size-lg;
  }
  
  &__content {
    flex: 1;
    padding-right: v.$spacing-md;
  }
  
  &__title {
    font-weight: v.$font-weight-semibold;
    margin-bottom: v.$spacing-xs;
  }
  
  &__message {
    font-size: v.$font-size-sm;
  }
  
  &__close {
    background: transparent;
    border: none;
    color: inherit;
    opacity: 0.7;
    cursor: pointer;
    padding: v.$spacing-xs;
    font-size: v.$font-size-sm;
    margin: -v.$spacing-xs;
    border-radius: v.$border-radius-sm;
    
    &:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  // Colores por tipo
  &--success {
    background-color: rgba(c.$color-success, 0.1);
    color: darken(c.$color-success, 10%);
    border-left: 4px solid c.$color-success;
  }
  
  &--error {
    background-color: rgba(c.$color-error, 0.1);
    color: darken(c.$color-error, 10%);
    border-left: 4px solid c.$color-error;
  }
  
  &--warning {
    background-color: rgba(c.$color-warning, 0.1);
    color: darken(c.$color-warning, 15%);
    border-left: 4px solid c.$color-warning;
  }
  
  &--info {
    background-color: rgba(c.$color-info, 0.1);
    color: darken(c.$color-info, 10%);
    border-left: 4px solid c.$color-info;
  }
}

// Animaciones
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style> 