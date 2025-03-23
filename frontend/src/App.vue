<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import ThemeTransition from './components/base/ThemeTransition.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import { useThemeStore } from './stores/theme'
import '@fortawesome/fontawesome-free/css/all.min.css'

const themeStore = useThemeStore()
const route = useRoute()

// Determinar si estamos en la página de autenticación
const isAuthPage = computed(() => route.path.startsWith('/auth'))
</script>

<template>
  <div class="min-h-screen transition-colors duration-300" :class="{ 'dark-theme dark': themeStore.isDark }">
    <ThemeTransition />
    <main class="p-4 md:p-5 mx-auto min-h-[calc(100vh-64px)] flex flex-col transition-colors duration-300" 
          :class="{ 'p-0 max-w-none min-h-screen': isAuthPage, 'max-w-7xl': !isAuthPage }">
      <RouterView />
    </main>
    <NotificationContainer />
  </div>
</template>
