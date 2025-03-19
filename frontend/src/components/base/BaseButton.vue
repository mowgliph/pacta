<template>
  <button
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--block': block },
      { 'base-button--icon-only': iconOnly },
      { 'base-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <i v-if="icon && !iconRight" :class="['base-button__icon', icon]"></i>
    <span v-if="!iconOnly" class="base-button__text">
      <slot></slot>
    </span>
    <i v-if="icon && iconRight" :class="['base-button__icon', 'base-button__icon--right', icon]"></i>
    <span v-if="loading" class="base-button__loader">
      <span class="base-button__loader-dot"></span>
      <span class="base-button__loader-dot"></span>
      <span class="base-button__loader-dot"></span>
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'tertiary', 'danger', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  iconOnly: {
    type: Boolean,
    default: false
  },
  iconRight: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/_variables.scss' as v;
@use '../../../assets/styles/_colors.scss' as c;
@use '../../../assets/styles/_mixins.scss' as m;

.base-button {
  @include m.button-text;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: v.$border-radius;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  // Variants
  &--primary {
    background-color: c.$color-primary;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: c.$color-primary-dark;
    }
  }
  
  &--secondary {
    background-color: white;
    color: c.$color-text-primary;
    border: 1px solid var(--color-border);
    
    &:hover:not(:disabled) {
      background-color: #f5f5f5;
    }
  }
  
  &--tertiary {
    background-color: rgba(c.$color-primary, 0.1);
    color: c.$color-primary;
    
    &:hover:not(:disabled) {
      background-color: rgba(c.$color-primary, 0.2);
    }
  }
  
  &--danger {
    background-color: c.$color-error;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: darken(c.$color-error, 10%);
    }
  }
  
  &--text {
    background-color: transparent;
    color: c.$color-primary;
    padding: 0;
    
    &:hover:not(:disabled) {
      color: c.$color-primary-dark;
      background-color: transparent;
    }
  }
  
  // Sizes
  &--sm {
    padding: v.$spacing-unit * 1 v.$spacing-unit * 2;
    font-size: v.$font-size-xs;
  }
  
  &--md {
    padding: v.$spacing-unit * 2 v.$spacing-unit * 3;
    font-size: v.$font-size-sm;
  }
  
  &--lg {
    padding: v.$spacing-unit * 3 v.$spacing-unit * 4;
    font-size: v.$font-size-md;
  }
  
  // Block
  &--block {
    display: flex;
    width: 100%;
  }
  
  // Icon only
  &--icon-only {
    aspect-ratio: 1/1;
    padding: 0;
    
    &.base-button--sm {
      width: v.$spacing-unit * 7;
    }
    
    &.base-button--md {
      width: v.$spacing-unit * 9;
    }
    
    &.base-button--lg {
      width: v.$spacing-unit * 11;
    }
  }
  
  // Loading state
  &--loading {
    color: transparent;
    
    .base-button__icon,
    .base-button__text {
      visibility: hidden;
    }
  }
  
  // Icon
  &__icon {
    font-size: 1.2em;
    display: inline-flex;
    
    &:not(.base-button__icon--right) {
      margin-right: v.$spacing-unit * 1;
    }
    
    &--right {
      margin-left: v.$spacing-unit * 1;
    }
  }
  
  // Loader
  &__loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    
    &-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
      margin: 0 2px;
      animation: dot-flashing 1s infinite alternate;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes dot-flashing {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
</style>