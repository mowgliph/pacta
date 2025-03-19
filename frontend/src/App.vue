<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <div class="app" :class="{ 'dark-theme': themeStore.isDark }">
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style lang="scss">
@use './assets/main.scss';

.app {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text-primary);
}

.main-content {
  padding: 1rem;
  max-width: 1280px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .main-content {
    padding: 0.5rem;
  }
}

/* Global transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
