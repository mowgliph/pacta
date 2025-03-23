<template>
  <div class="auth">
    <div class="auth__container">
      <div class="auth__logo">
        <img src="@/assets/logo.svg" alt="PACTA Logo" />
        <h1>PACTA</h1>
      </div>
      <div class="auth__card">
        <router-view />
      </div>
      <div class="auth__footer">
        <p>&copy; {{ currentYear }} PACTA - Sistema de Gestión de Contratos. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style lang="scss" scoped>
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;

.auth {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: v.$spacing-xl;
  background: linear-gradient(135deg, c.$color-background 0%, darken(c.$color-background, 5%) 100%);

  &__container {
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: v.$spacing-xl;
  }

  &__logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: v.$spacing-md;
    
    img {
      width: 64px;
      height: 64px;
    }
    
    h1 {
      font-size: v.$font-size-xxl;
      font-weight: v.$font-weight-bold;
      color: c.$color-text-primary;
      margin: 0;
    }
  }

  &__card {
    width: 100%;
    background-color: c.$color-surface;
    border-radius: v.$border-radius;
    box-shadow: v.$shadow-lg;
    overflow: hidden;
  }

  &__footer {
    text-align: center;
    color: c.$color-text-secondary;
    font-size: v.$font-size-sm;
  }
}
</style> 