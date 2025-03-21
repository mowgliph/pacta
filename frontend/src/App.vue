<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import ThemeTransition from './components/base/ThemeTransition.vue'
import Toast from './components/shared/Toast.vue'
import { useThemeStore } from './stores/theme'
import '@fortawesome/fontawesome-free/css/all.min.css'

const themeStore = useThemeStore()
const route = useRoute()

// Determinar si estamos en la página de login
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <div class="app" :class="{ 'dark-theme': themeStore.isDark }">
    <ThemeTransition />
    <main class="main-content" :class="{ 'login-page': isLoginPage }">
      <RouterView />
    </main>
    <Toast />
  </div>
</template>

<style lang="scss">
@use './App.scss';
</style>
