<template>
  <div class="flex items-center justify-center min-h-screen p-8 bg-background">
    <div class="max-w-[600px] w-full text-center p-8 bg-surface rounded-md shadow-md transition-all duration-200">
      <h1 class="text-6xl mb-4 text-primary font-bold">404</h1>
      <h2 class="text-2xl mb-4 text-text-primary font-medium">Página no encontrada</h2>
      <p class="mb-8 text-text-secondary">Lo sentimos, la página que buscas no existe.</p>
      <button 
        @click="goBack" 
        class="min-w-[150px] py-2 px-6 rounded bg-primary text-white shadow-sm 
               transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
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