import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // Estado - siempre en modo claro
  const isDark = ref(false);
  
  // Acciones - mantener por compatibilidad pero sin efecto
  function toggleTheme() {
    // No hace nada, siempre en modo claro
    return;
  }
  
  function setDarkTheme(value: boolean) {
    // No hace nada, ignoramos el valor
    return;
  }
  
  function initTheme() {
    // Asegurar que se elimine cualquier clase dark-theme
    document.documentElement.classList.remove('dark-theme');
    
    // Limpiar el tema almacenado
    localStorage.removeItem('theme');
  }
  
  return {
    isDark,  // Siempre false
    toggleTheme,
    setDarkTheme,
    initTheme
  };
});