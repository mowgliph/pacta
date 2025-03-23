import { ref, watch } from 'vue';

const isDark = ref(false);

// Inicializar tema basado en preferencias del sistema
if (typeof window !== 'undefined') {
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Escuchar cambios en las preferencias del sistema
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDark.value = e.matches;
  });
}

// Escuchar cambios en el tema
watch(isDark, (newValue) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', newValue);
  }
}, { immediate: true });

export function useTheme() {
  return {
    isDark,
    toggleTheme: () => isDark.value = !isDark.value
  };
} 