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
  <div class="app" :class="{ 'dark-theme': themeStore.isDark }">
    <ThemeTransition />
    <main class="main-content" :class="{ 'auth-page': isAuthPage }">
      <RouterView />
    </main>
    <NotificationContainer />
  </div>
</template>

<style lang="scss">
@use './App.scss';
</style>
