<template>
  <div class="base-toggle">
    <label v-if="label" class="base-toggle__label">{{ label }}</label>
    <div class="base-toggle__switch">
      <input
        type="checkbox"
        :id="id"
        :checked="modelValue"
        @change="handleChange"
      />
      <span class="base-toggle__slider"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  modelValue: boolean;
  id: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;

.base-toggle {
  display: flex;
  align-items: center;
  gap: v.$spacing-md;
  
  &__label {
    @include m.form-label;
    margin-bottom: 0;
    cursor: pointer;
  }
  
  &__switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
    
    input {
      opacity: 0;
      width: 0;
      height: 0;
      
      &:checked + .base-toggle__slider {
        background-color: c.$color-primary;
      }
      
      &:checked + .base-toggle__slider:before {
        transform: translateX(26px);
      }
      
      &:focus + .base-toggle__slider {
        box-shadow: 0 0 0 2px rgba(c.$color-primary, 0.2);
      }
    }
  }
  
  &__slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: c.$color-border;
    transition: v.$transition-normal;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: v.$transition-normal;
      border-radius: 50%;
    }
    
    &:hover {
      background-color: darken-compat(c.$color-border, 10%);
    }
  }
}
</style> 