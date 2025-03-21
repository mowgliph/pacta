<template>
  <div class="logo">
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="logo-svg"
    >
      <path
        d="M20 8L28 12V20C28 25.55 24.16 30.74 19 32C13.84 30.74 10 25.55 10 20V12L18 8M19 12H12V18.5C12 22.15 14.75 25.82 18.5 27V12H25.5V18.5C25.5 22.15 22.75 25.82 19 27V12Z"
        fill="currentColor"
        class="logo-icon"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
// No props needed anymore
</script>

<style lang="scss" scoped>
@use '../../styles/colors' as c;
@use '../../styles/variables' as v;

.logo {
  display: inline-block;
  transition: color v.$transition-duration-base ease;
  color: #FFFFFF; // Blanco para contrastar con el fondo azul del sidebar
  
  &-svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  
  &-icon {
    transition: fill v.$transition-duration-base ease;
  }
}
</style>