<template>
  <Transition
    enter-active-class="transition-opacity duration-500 ease-in-out"
    leave-active-class="transition-opacity duration-500 ease-in-out"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div v-if="transitionActive" class="fixed inset-0 bg-black/20 z-[9999] pointer-events-none"></div>
  </Transition>
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