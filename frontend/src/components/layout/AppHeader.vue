<template>
  <header class="header">
    <div class="header__left">
      <Logo class="header__logo" :variant="isDark ? 'light' : 'dark'" />
      
    </div>
    
    <div class="header__right">
      <a href="/docs" class="help-link" title="Documentación">
        <i class="fas fa-book"></i>
        <span>Ayuda</span>
      </a>
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useThemeStore } from '../../stores/theme';
import { storeToRefs } from 'pinia';
import Logo from '../base/Logo.vue';

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

function toggleTheme() {
  themeStore.toggleTheme();
}
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;
@use '../../styles/typography' as t;

.header {
  padding: v.$spacing-unit * 4;
  background: c.$color-surface;
  border-bottom: 1px solid c.$color-border;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;

  &__left {
    display: flex;
    align-items: center;
    gap: v.$spacing-unit * 2;
  }

  &__logo {
    height: 40px;
    width: auto;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: c.$color-text-primary;
    margin: 0;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: v.$spacing-unit * 2;
  }
}

.help-link {
  display: flex;
  align-items: center;
  gap: v.$spacing-unit;
  color: c.$color-text-primary;
  text-decoration: none;
  padding: v.$spacing-unit * 2;
  border-radius: v.$border-radius;
  transition: background-color 0.2s;

  &:hover {
    background: c.$color-surface-hover;
  }

  i {
    font-size: 1.2rem;
  }

  span {
    font-size: 0.9rem;
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
    background: c.$color-surface-hover;
  }
}
</style>