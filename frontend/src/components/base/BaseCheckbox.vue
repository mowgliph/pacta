<template>
  <label class="base-checkbox">
    <span v-if="label" class="base-checkbox__label">{{ label }}</span>
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="handleChange"
      class="base-checkbox__input"
    />
    <span class="base-checkbox__checkmark"></span>
  </label>
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

.base-checkbox {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  user-select: none;
  gap: v.$spacing-sm;
  
  &__label {
    color: c.$color-text-secondary;
    font-size: v.$font-size-sm;
    padding-left: 28px;
  }
  
  &__input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    
    &:checked ~ .base-checkbox__checkmark {
      background-color: c.$color-primary;
      border-color: c.$color-primary;
      
      &:after {
        display: block;
      }
    }
    
    &:focus ~ .base-checkbox__checkmark {
      box-shadow: 0 0 0 2px rgba(c.$color-primary, 0.2);
    }
  }
  
  &__checkmark {
    position: absolute;
    left: 0;
    top: 0;
    height: 18px;
    width: 18px;
    background-color: c.$color-surface;
    border: 1px solid c.$color-border;
    border-radius: v.$border-radius-sm;
    transition: all v.$transition-normal;
    
    &:after {
      content: "";
      position: absolute;
      display: none;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
  
  &:hover .base-checkbox__checkmark {
    border-color: c.$color-primary;
  }
}
</style> 