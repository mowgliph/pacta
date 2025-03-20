<template>
  <div :class="['logo', `logo--${variant}`]">
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 8L28 12V20C28 25.55 24.16 30.74 19 32C13.84 30.74 10 25.55 10 20V12L18 8M19 12H12V18.5C12 22.15 14.75 25.82 18.5 27V12H25.5V18.5C25.5 22.15 22.75 25.82 19 27V12Z"
        fill="currentColor"
      />
      <text
        x="40"
        y="24"
        font-family="Poppins"
        font-weight="600"
        font-size="24"
        fill="currentColor"
      >
        PACTA
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'light' | 'dark';
}>();
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;
@use '../../styles/typography' as t;

.logo {
  display: inline-block;
  
  &--light {
    color: var(--color-text-light);
  }
  
  &--dark {
    color: var(--color-primary);
  }
}
</style>