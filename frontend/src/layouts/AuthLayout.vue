<template>
  <div class="min-h-screen flex flex-col justify-center items-center p-8 bg-gradient-to-br from-background to-background-dark">
    <div class="w-full max-w-[480px] flex flex-col items-center gap-8">
      <div class="flex flex-col items-center gap-4">
        <img src="@/assets/logo.svg" alt="PACTA Logo" class="w-16 h-16" />
        <h1 class="text-3xl font-bold text-text-primary m-0">PACTA</h1>
      </div>
      <div class="w-full bg-surface rounded shadow-lg overflow-hidden">
        <router-view />
      </div>
      <div class="text-center text-text-secondary text-sm">
        <p>&copy; {{ currentYear }} PACTA - Sistema de Gestión de Contratos. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script> 