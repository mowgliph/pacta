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
.not-found {
  @include m.flex-center;
  min-height: 100vh;
  padding: 2rem;
  background-color: c.$color-background;

  .content {
    @include m.card-style;
    max-width: 600px;
    width: 100%;
    text-align: center;
    padding: 2rem;

    h1 {
      @include m.heading-1;
      margin-bottom: 1rem;
      color: c.$color-primary;
    }

    h2 {
      @include m.heading-2;
      margin-bottom: 1rem;
      color: c.$color-text;
    }

    p {
      @include m.text;
      margin-bottom: 2rem;
      color: c.$color-text-secondary;
    }

    button {
      @include m.button-theme('primary');
      min-width: 150px;
    }
  }
}
</style> 