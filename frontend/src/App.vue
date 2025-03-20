<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import { useThemeStore } from './stores/theme'
import '@fortawesome/fontawesome-free/css/all.min.css'

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
@use 'styles/variables' as v;
@use 'styles/colors' as c;
@use 'styles/mixins' as m;
@use 'styles/typography' as ty;

:root {
  --primary-color: #{c.$color-primary};
  --primary-color-light: #{c.$color-primary-light};
  --primary-color-dark: #{c.$color-primary-dark};
  --surface-color: #{c.$color-surface};
  --background-color: #{c.$color-background};
  --text-primary: #{c.$color-text-primary};
  --text-secondary: #{c.$color-text-secondary};
  --border-color: #{c.$color-border};
  --hover-color: #{c.$color-hover};
}

body {
  @include m.body-text;
  background-color: c.$color-background;
  color: c.$color-text-primary;
  line-height: ty.$line-height-base;
}

#app {
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  background: c.$color-background;
  color: c.$color-text-primary;
}

.main-content {
  padding: v.$spacing-md;
  max-width: v.$container-max-width;
  margin: 0 auto;
  min-height: calc(100vh - v.$header-height);
  display: flex;
  flex-direction: column;
}

@media (max-width: v.$breakpoint-md) {
  .main-content {
    padding: v.$spacing-sm;
  }
}

/* Global transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity v.$transition-duration-base ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
