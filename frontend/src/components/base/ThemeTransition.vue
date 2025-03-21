<template>
  <transition name="theme-transition">
    <div v-if="transitionActive" class="theme-transition-overlay"></div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useThemeStore } from '../../stores/theme';
import { storeToRefs } from 'pinia';

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
const transitionActive = ref(false);

// Observar cambios en el tema para activar la animación
watch(() => isDark.value, () => {
  transitionActive.value = true;
  
  // Ocultar el overlay después de la animación
  setTimeout(() => {
    transitionActive.value = false;
  }, 600); // Tiempo suficiente para que la animación termine
});
</script>

<style lang="scss" scoped>
.theme-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 9999;
  pointer-events: none;
}

.theme-transition-enter-active,
.theme-transition-leave-active {
  transition: opacity 0.5s ease;
}

.theme-transition-enter-from,
.theme-transition-leave-to {
  opacity: 0;
}
</style> 