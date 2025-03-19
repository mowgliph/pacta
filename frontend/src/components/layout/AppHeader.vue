<template>
  <header class="header">
    <div class="header__actions">
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import { storeToRefs } from 'pinia';

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

function toggleTheme() {
  themeStore.toggleTheme();
}
</script>

<style lang="scss" scoped>
@import '../../assets/main.scss';

.header {
  padding: $spacing-unit * 4;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 64px;

  &__actions {
    display: flex;
    gap: $spacing-unit * 2;
  }
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: $spacing-unit * 2;
  border-radius: $border-radius;
  
  &:hover {
    background: var(--color-surface-hover);
  }
}
</style>