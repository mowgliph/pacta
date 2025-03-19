<template>
  <header class="header">
    <div class="header__actions">
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useThemeStore } from '../../stores/theme';
import { storeToRefs } from 'pinia';

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

function toggleTheme() {
  themeStore.toggleTheme();
}
</script>

<style lang="scss" scoped>
@use '../../assets/styles/_variables.scss' as v;
@use '../../assets/styles/_colors.scss' as c;

.header {
  padding: v.$spacing-unit * 4;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 64px;

  &__actions {
    display: flex;
    gap: v.$spacing-unit * 2;
  }
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: v.$spacing-unit * 2;
  border-radius: v.$border-radius;
  
  &:hover {
    background: var(--color-surface-hover);
  }
}
</style>