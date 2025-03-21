<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <button @click="goBack" class="btn-primary">
        Volver
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
@use '../styles/colors' as c;
@use '../styles/variables' as v;
@use '../styles/mixins' as m;

.not-found {
  @include m.flex-center;
  min-height: 100vh;
  padding: v.$spacing-xl;
  background-color: c.$color-background;

  .content {
    @include m.card-style;
    max-width: 600px;
    width: 100%;
    text-align: center;
    padding: v.$spacing-xl;
    border-radius: v.$border-radius-md;
    box-shadow: v.$shadow-md;
    transition: v.$transition-normal;

    h1 {
      @include m.heading-1;
      margin-bottom: v.$spacing-md;
      color: c.$color-primary;
      font-size: 4rem;
      font-weight: v.$font-weight-bold;
    }

    h2 {
      @include m.heading-2;
      margin-bottom: v.$spacing-md;
      color: c.$color-text-primary;
      font-weight: v.$font-weight-medium;
    }

    p {
      @include m.text-base;
      margin-bottom: v.$spacing-xl;
      color: c.$color-text-secondary;
    }

    button {
      @include m.button-theme('primary');
      min-width: 150px;
      padding: v.$spacing-sm v.$spacing-lg;
      border-radius: v.$border-radius;
      transition: v.$transition-normal;
      
      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}
</style> 